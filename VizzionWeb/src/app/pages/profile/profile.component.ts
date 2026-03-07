import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, map } from 'rxjs/operators';
import { Subject, of, concat, Observable, throwError } from 'rxjs';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: any = {
    id: null,
    fullName: '',
    email: '',
    username: '',
    role: '',
    profilePictureData: null,
    profilePictureContentType: ''
  };
  originalUser: any;
  isEditing = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  usernameAvailability: boolean | null = null;
  emailAvailability: boolean | null = null;
  private usernameChanged: Subject<string> = new Subject<string>();
  private emailChanged: Subject<string> = new Subject<string>();

  enablePasswordChange = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  currentPasswordValid: boolean | null = null;
  newPasswordDifferent: boolean | null = null;
  newPasswordLengthValid: boolean | null = null;
  passwordsMatch: boolean | null = null;

  private currentPasswordChanged: Subject<string> = new Subject<string>();
  private newPasswordChanged: Subject<string> = new Subject<string>();
  private confirmPasswordChanged: Subject<string> = new Subject<string>();

  selectedFile: File | null = null;
  profilePicturePreviewUrl: string | null = null;

  // Estado para el modal de confirmación
  showEmailChangeModal = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    console.log('ProfileComponent constructor loaded.');
  }

  ngOnInit(): void {
    this.loadUserProfile();

    this.usernameChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(username => {
        if (username && username !== this.originalUser.username) {
          return this.userService.checkUsernameAvailability(username, this.user.id);
        }
        return of(true);
      })
    ).subscribe(isAvailable => {
      this.usernameAvailability = isAvailable;
      this.cdr.detectChanges();
    });

    this.emailChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => {
        if (email && email !== this.originalUser.email) {
          return this.userService.checkEmailAvailability(email, this.user.id);
        }
        return of(true);
      })
    ).subscribe(isAvailable => {
      this.emailAvailability = isAvailable;
      this.cdr.detectChanges();
    });

    this.currentPasswordChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(password => {
        if (password) {
          return this.userService.validateCurrentPassword(password);
        }
        return of(false);
      })
    ).subscribe(isValid => {
      this.currentPasswordValid = isValid;
      this.cdr.detectChanges();
    });

    this.newPasswordChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(newPass => {
      this.newPasswordLengthValid = !!(newPass && newPass.length >= 6);
      this.newPasswordDifferent = !!(newPass && newPass !== this.currentPassword);
      this.passwordsMatch = !!(newPass && newPass === this.confirmPassword);
      this.cdr.detectChanges();
    });

    this.confirmPasswordChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(confirmPass => {
      this.passwordsMatch = !!(confirmPass && confirmPass === this.newPassword);
      this.cdr.detectChanges();
    });
  }

  loadUserProfile(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getCurrentUserProfile().subscribe({
        next: (data) => {
          this.user = { ...data };
          this.originalUser = { ...data };
          this.user.role = this.authService.getUserRole();
          if (this.user.profilePictureData && this.user.profilePictureContentType) {
            this.profilePicturePreviewUrl = `data:${this.user.profilePictureContentType};base64,${this.user.profilePictureData}`;
          } else {
            this.profilePicturePreviewUrl = 'https://via.placeholder.com/150/007bff/ffffff?text=JD';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar el perfil:', err);
          this.errorMessage = 'No se pudo cargar el perfil del usuario.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.errorMessage = 'No se pudo obtener el ID del usuario para cargar el perfil.';
      this.authService.logout();
      this.router.navigate(['/login']);
      this.cdr.detectChanges();
    }
  }

  onEdit(): void {
    this.isEditing = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.usernameAvailability = null;
    this.emailAvailability = null;
    this.resetPasswordFields();
    this.selectedFile = null;
    this.profilePicturePreviewUrl = this.user.profilePictureData && this.user.profilePictureContentType
                                    ? `data:${this.user.profilePictureContentType};base64,${this.user.profilePictureData}`
                                    : 'https://via.placeholder.com/150/007bff/ffffff?text=JD';
  }

  onCancel(): void {
    this.isEditing = false;
    this.user = { ...this.originalUser };
    this.errorMessage = null;
    this.successMessage = null;
    this.usernameAvailability = null;
    this.emailAvailability = null;
    this.enablePasswordChange = false;
    this.resetPasswordFields();
    this.selectedFile = null;
    this.profilePicturePreviewUrl = this.user.profilePictureData && this.user.profilePictureContentType
                                    ? `data:${this.user.profilePictureContentType};base64,${this.user.profilePictureData}`
                                    : 'https://via.placeholder.com/150/007bff/ffffff?text=JD';
  }

  onSave(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.usernameAvailability === false || this.emailAvailability === false) {
      this.errorMessage = 'Por favor, corrija los errores de disponibilidad de usuario/email.';
      return;
    }

    // Verificar si hay cambio de email
    if (this.user.email !== this.originalUser.email) {
      this.showEmailChangeModal = true;
      return;
    }

    // Si no hay cambio de email, proceder directamente
    this.executeSave(false);
  }

  onConfirmEmailChange(): void {
    this.showEmailChangeModal = false;
    this.executeSave(true);
  }

  onCancelEmailChange(): void {
    this.showEmailChangeModal = false;
    // Revertir el cambio de email pero permitir guardar otros cambios si los hay
    this.user.email = this.originalUser.email;
    this.executeSave(false);
  }

  private executeSave(emailChangedConfirmed: boolean): void {
    let profileUpdateSuccess = false;
    let passwordChangeSuccess = false;
    let photoUploadSuccess = false;

    // 1. Observable para la subida de foto de perfil
    let photoUploadOperation$: Observable<any> = of(null);
    if (this.selectedFile) {
      photoUploadOperation$ = this.userService.uploadProfilePicture(this.selectedFile).pipe(
        tap((data) => {
          this.user.profilePictureData = data.profilePictureData;
          this.user.profilePictureContentType = data.profilePictureContentType;
          this.originalUser.profilePictureData = data.profilePictureData;
          this.originalUser.profilePictureContentType = data.profilePictureContentType;
          this.profilePicturePreviewUrl = `data:${this.user.profilePictureContentType};base64,${this.user.profilePictureData}`;
          this.successMessage = 'Foto de perfil actualizada exitosamente.';
          this.errorMessage = null;
          photoUploadSuccess = true;
        }),
        catchError((err) => {
          console.error('userService.uploadProfilePicture() - Error:', err);
          this.errorMessage = 'No se pudo subir la foto de perfil. ' + (err.error.message || '');
          this.cdr.detectChanges();
          return throwError(() => new Error('Error en subida de foto de perfil'));
        })
      );
    }

    // 2. Observable para el cambio de contraseña
    let passwordChangeOperation$: Observable<any> = of(null);
    if (this.enablePasswordChange) {
      if (!this.currentPasswordValid) {
        this.errorMessage = 'La contraseña actual no es válida.';
        return;
      }
      if (!this.newPasswordDifferent) {
        this.errorMessage = 'La nueva contraseña debe ser diferente a la actual.';
        return;
      }
      if (!this.passwordsMatch) {
        this.errorMessage = 'La nueva contraseña y la confirmación no coinciden.';
        return;
      }
      if (!this.newPasswordLengthValid) {
        this.errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres.';
        return;
      }

      passwordChangeOperation$ = this.userService.changePassword(this.currentPassword, this.newPassword).pipe(
        tap(() => {
          this.successMessage = 'Contraseña actualizada exitosamente.';
          this.resetPasswordFields();
          this.enablePasswordChange = false;
          passwordChangeSuccess = true;
        }),
        catchError((err) => {
          console.error('userService.changePassword() - Error:', err);
          this.errorMessage = 'No se pudo cambiar la contraseña. ' + (err.error.message || '');
          this.cdr.detectChanges();
          return throwError(() => new Error('Error en cambio de contraseña'));
        })
      );
    }

    // 3. Observable para la actualización de los datos del perfil
    let profileUpdateOperation$: Observable<any> = of(null);
    const hasProfileDataChanged =
      this.user.fullName !== this.originalUser.fullName ||
      this.user.username !== this.originalUser.username ||
      this.user.email !== this.originalUser.email;

    if (hasProfileDataChanged) {
      const updatedData = {
        fullName: this.user.fullName,
        email: this.user.email,
        username: this.user.username,
      };

      profileUpdateOperation$ = this.userService.updateCurrentUserProfile(updatedData).pipe(
        tap({
          next: (data) => {
            this.user = { ...data };
            this.originalUser = { ...data };
            this.user.role = this.authService.getUserRole();
            this.isEditing = false;
            this.successMessage = 'Perfil actualizado exitosamente.';

            if (emailChangedConfirmed) {
               this.successMessage += ' Por favor, inicie sesión con su nuevo correo.';
               setTimeout(() => {
                 this.authService.logout();
                 this.router.navigate(['/login']);
               }, 2000);
            }

            this.cdr.detectChanges();
            profileUpdateSuccess = true;
          },
          error: (err) => {
            console.error('userService.updateCurrentUserProfile() - Error:', err);
            this.errorMessage = 'No se pudo actualizar el perfil. ' + (err.error.message || '');
            this.cdr.detectChanges();
          }
        })
      );
    }

    // Combinar todas las operaciones
    concat(photoUploadOperation$, passwordChangeOperation$, profileUpdateOperation$).pipe(
      catchError((err) => {
        console.error('Error en la secuencia concat de onSave:', err);
        return of(null);
      })
    ).subscribe(() => {
      if (!this.errorMessage && !this.successMessage) {
        this.successMessage = 'No se detectaron cambios para guardar.';
      }
      if (!emailChangedConfirmed) {
          this.isEditing = false;
      }
      this.cdr.detectChanges();
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicturePreviewUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.profilePicturePreviewUrl = this.user.profilePictureData && this.user.profilePictureContentType
                                      ? `data:${this.user.profilePictureContentType};base64,${this.user.profilePictureData}`
                                      : 'https://via.placeholder.com/150/007bff/ffffff?text=JD';
    }
  }

  onUsernameChange(username: string): void {
    this.usernameChanged.next(username);
  }

  onEmailChange(email: string): void {
    this.emailChanged.next(email);
  }

  onCurrentPasswordChange(password: string): void {
    this.currentPasswordChanged.next(password);
  }

  onNewPasswordChange(password: string): void {
    this.newPasswordChanged.next(password);
  }

  onConfirmPasswordChange(password: string): void {
    this.confirmPasswordChanged.next(password);
  }

  resetPasswordFields(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.currentPasswordValid = null;
    this.newPasswordDifferent = null;
    this.passwordsMatch = null;
    this.newPasswordLengthValid = null;
  }
}
