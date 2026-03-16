import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, map } from 'rxjs/operators';
import { Subject, of, concat, Observable, throwError } from 'rxjs';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: Usuario = {
    username: '', email: '', role: ''
  };
  originalUser: Usuario = {
    username: '', email: '', role: ''
  };
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

  newPasswordDifferent: boolean | null = null;
  newPasswordLengthValid: boolean | null = null;
  passwordsMatch: boolean | null = null;

  private currentPasswordChanged: Subject<string> = new Subject<string>();
  private newPasswordChanged: Subject<string> = new Subject<string>();
  private confirmPasswordChanged: Subject<string> = new Subject<string>();

  selectedFile: File | null = null;
  profilePicturePreviewUrl: string | null = null;

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
          return this.userService.checkUsernameAvailability(username, this.user.id!);
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
          return this.userService.checkEmailAvailability(email, this.user.id!);
        }
        return of(true);
      })
    ).subscribe(isAvailable => {
      this.emailAvailability = isAvailable;
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
        next: (data: Usuario) => {
          this.user = { ...data };
          this.originalUser = { ...data };
          this.user.role = this.authService.getUserRole() || '';
          if (this.user.profilePictureUrl) {
            this.profilePicturePreviewUrl = this.user.profilePictureUrl;
          } else {
            this.profilePicturePreviewUrl = 'https://via.placeholder.com/150/007bff/ffffff?text=JD';
          }
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
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
    this.profilePicturePreviewUrl = this.user.profilePictureUrl
                                    ? this.user.profilePictureUrl
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
    this.profilePicturePreviewUrl = this.user.profilePictureUrl
                                    ? this.user.profilePictureUrl
                                    : 'https://via.placeholder.com/150/007bff/ffffff?text=JD';
  }

  onSave(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.usernameAvailability === false || this.emailAvailability === false) {
      this.errorMessage = 'Por favor, corrija los errores de disponibilidad de usuario/email.';
      return;
    }

    if (this.enablePasswordChange && !this.isPasswordChangeValid()) {
      return;
    }

    if (this.user.email !== this.originalUser.email) {
      this.showEmailChangeModal = true;
      return;
    }

    this.executeSave(false);
  }

  onConfirmEmailChange(): void {
    this.showEmailChangeModal = false;
    this.executeSave(true);
  }

  onCancelEmailChange(): void {
    this.showEmailChangeModal = false;
    this.user.email = this.originalUser.email;
    this.executeSave(false);
  }

  private isPasswordChangeValid(): boolean {
    if (!this.newPasswordDifferent) {
      this.errorMessage = 'La nueva contraseña debe ser diferente a la actual.';
      return false;
    }
    if (!this.passwordsMatch) {
      this.errorMessage = 'La nueva contraseña y la confirmación no coinciden.';
      return false;
    }
    if (!this.newPasswordLengthValid) {
      this.errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return false;
    }
    return true;
  }

  private executeSave(emailChangedConfirmed: boolean): void {
    let photoUploadOperation$: Observable<Usuario | null> = of(null);
    if (this.selectedFile) {
      photoUploadOperation$ = this.userService.uploadProfilePicture(this.selectedFile).pipe(
        tap((data: Usuario) => {
          this.user.profilePictureUrl = data.profilePictureUrl;
          this.originalUser.profilePictureUrl = data.profilePictureUrl;
          this.profilePicturePreviewUrl = this.user.profilePictureUrl || 'https://via.placeholder.com/150/007bff/ffffff?text=JD';
          this.successMessage = 'Foto de perfil actualizada exitosamente.';
          this.errorMessage = null;
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('userService.uploadProfilePicture() - Error:', err);
          this.errorMessage = 'No se pudo subir la foto de perfil. ' + (err.error?.message || '');
          this.cdr.detectChanges();
          return throwError(() => new Error('Error en subida de foto de perfil'));
        })
      );
    }

    let passwordChangeOperation$: Observable<void | null> = of(null);
    if (this.enablePasswordChange && this.isPasswordChangeValid()) {
      // Corregido: Llamar a updatePassword en lugar de changePassword
      passwordChangeOperation$ = this.userService.updatePassword(this.currentPassword, this.newPassword).pipe(
        tap(() => {
          this.successMessage = 'Contraseña actualizada exitosamente.';
          this.resetPasswordFields();
          this.enablePasswordChange = false;
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('userService.updatePassword() - Error:', err);
          this.errorMessage = 'No se pudo cambiar la contraseña. ' + (err.error?.message || '');
          this.cdr.detectChanges();
          return throwError(() => new Error('Error en cambio de contraseña'));
        })
      );
    }

    let profileUpdateOperation$: Observable<Usuario | null> = of(null);
    const hasProfileDataChanged =
      this.user.fullName !== this.originalUser.fullName ||
      this.user.username !== this.originalUser.username ||
      this.user.email !== this.originalUser.email;

    if (hasProfileDataChanged) {
      const updatedData: Usuario = {
        id: this.user.id,
        fullName: this.user.fullName,
        email: this.user.email,
        username: this.user.username,
        role: this.user.role
      };

      profileUpdateOperation$ = this.userService.updateCurrentUserProfile(updatedData).pipe(
        tap({
          next: (data: Usuario) => {
            this.user = { ...data };
            this.originalUser = { ...data };
            this.user.role = this.authService.getUserRole() || '';
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
          },
          error: (err: HttpErrorResponse) => {
            console.error('userService.updateCurrentUserProfile() - Error:', err);
            this.errorMessage = 'No se pudo actualizar el perfil. ' + (err.error?.message || '');
            this.cdr.detectChanges();
          }
        })
      );
    }

    concat(photoUploadOperation$, passwordChangeOperation$, profileUpdateOperation$).pipe(
      catchError((err: HttpErrorResponse) => {
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
      this.profilePicturePreviewUrl = this.user.profilePictureUrl
                                      ? this.user.profilePictureUrl
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
    this.newPasswordDifferent = null;
    this.passwordsMatch = null;
    this.newPasswordLengthValid = null;
  }
}
