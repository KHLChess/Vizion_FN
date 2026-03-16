import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss'
})
export class UserPanelComponent implements OnInit, OnDestroy {
  title: string = 'Panel de Usuario';
  description: string = 'Contenido específico para este panel.';

  dependents: Usuario[] = [];
  filteredDependents: Usuario[] = [];
  searchTerm: string = '';
  isLoading = false;
  currentUserRole: string | null = null;

  showPromoteModal = false;
  showDemoteModal = false;
  selectedUser: Usuario | null = null;
  targetRole: string = '';
  successorId: number | null = null;
  potentialSuccessors: Usuario[] = [];
  modalError: string = '';
  isProcessingAction = false;

  showRegisterModal = false;
  newUserData: Usuario = { fullName: '', email: '', username: '', password: '', role: 'CLIENT' };
  registerModalError = '';

  private usernameCheck = new Subject<string>();
  private emailCheck = new Subject<string>();
  private validationSubscriptions = new Subscription();
  isUsernameAvailable = true;
  isEmailAvailable = true;
  isCheckingUsername = false;
  isCheckingEmail = false;
  isEmailFormatValid = true;

  showConfirmationModal = false;
  showSuccessModal = false;
  confirmationModalConfig = {
    title: 'Confirmar Registro',
    message: '',
    confirmText: 'Registrar',
    type: 'info' as const
  };
  successModalConfig = {
    title: 'Operación Exitosa',
    message: 'La operación se ha completado correctamente.',
    confirmText: 'Aceptar',
    type: 'success' as const
  };

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserRole = this.authService.getUserRole();
    this.route.data.subscribe(data => {
      this.title = data['title'] || 'Panel de Usuario';
      this.description = data['description'] || 'Contenido específico para este panel.';
    });
    this.setupValidationChecks();
  }

  ngOnDestroy(): void {
    this.validationSubscriptions.unsubscribe();
  }

  private setupValidationChecks(): void {
    this.validationSubscriptions.add(
      this.usernameCheck.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(username => {
          this.isCheckingUsername = true;
          return this.userService.checkUsernameAvailability(username, 0).pipe(catchError(() => of(false)));
        })
      ).subscribe(isAvailable => {
        this.isUsernameAvailable = isAvailable;
        this.isCheckingUsername = false;
      })
    );

    this.validationSubscriptions.add(
      this.emailCheck.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          this.isCheckingEmail = true;
          return this.userService.checkEmailAvailability(email, 0).pipe(catchError(() => of(false)));
        })
      ).subscribe(isAvailable => {
        this.isEmailAvailable = isAvailable;
        this.isCheckingEmail = false;
      })
    );
  }

  onUsernameChange(username: string): void {
    if (username) this.usernameCheck.next(username);
  }

  onEmailChange(email: string): void {
    this.validateEmailFormat(email);
    if (email && this.isEmailFormatValid) {
      this.emailCheck.next(email);
    }
  }

  validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,4}$/;
    this.isEmailFormatValid = email ? emailRegex.test(email) : true;
  }

  loadDependentsHierarchy(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.isLoading = true;
      this.userService.getDependents(userId).subscribe({
        next: (data: Usuario[]) => {
          this.dependents = data || [];
          this.filterDependents();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Error al cargar dependientes:', err);
        }
      });
    }
  }

  filterDependents(): void {
    if (!this.searchTerm) {
      this.filteredDependents = [...this.dependents];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDependents = this.dependents.filter(user =>
        (user.fullName && user.fullName.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term))
      );
    }
  }

  closeModals() {
    this.showPromoteModal = false;
    this.showDemoteModal = false;
    this.showRegisterModal = false;
    this.showConfirmationModal = false;
    this.showSuccessModal = false;
    this.selectedUser = null;
  }

  // --- Lógica de Registro ---

  getAddButtonText(): string {
    if (['OWNER', 'MANAGER', 'SELLER'].includes(this.currentUserRole!)) return 'Agregar Cliente';
    if (this.currentUserRole === 'CLIENT') return 'Agregar Referido';
    return 'Agregar Usuario';
  }

  openRegisterModal() {
    this.newUserData = { fullName: '', email: '', username: '', password: '', role: 'CLIENT' };
    this.registerModalError = '';
    this.isUsernameAvailable = true;
    this.isEmailAvailable = true;
    this.isEmailFormatValid = true;
    this.showRegisterModal = true;
  }

  confirmRegister(): void {
    this.registerModalError = '';

    if (this.currentUserRole !== 'CLIENT') {
      this.validateEmailFormat(this.newUserData.email!);
      if (!this.isEmailAvailable || !this.isEmailFormatValid) {
        this.registerModalError = 'Por favor, corrija los errores en el email.';
        return;
      }
    }

    if (!this.isUsernameAvailable) {
      this.registerModalError = 'Por favor, corrija los errores en el nombre de usuario.';
      return;
    }

    this.confirmationModalConfig.message = `¿Está seguro de que desea registrar a ${this.newUserData.fullName}?`;
    this.showConfirmationModal = true;
  }

  executeRegister(): void {
    this.showConfirmationModal = false;
    const creatorId = this.authService.getUserId();
    if (!creatorId) {
      this.registerModalError = 'No se pudo identificar al usuario actual.';
      return;
    }

    let newRole = '';
    if (['OWNER', 'MANAGER', 'SELLER'].includes(this.currentUserRole!)) newRole = 'CLIENT';
    else if (this.currentUserRole === 'CLIENT') newRole = 'REFERIDO';

    const finalUserData: Usuario = { ...this.newUserData, role: newRole };
    if (newRole === 'REFERIDO') {
      finalUserData.password = undefined;
      finalUserData.email = ''; // Cambiado a cadena vacía
    }

    this.isProcessingAction = true;
    this.userService.registerSubordinate(finalUserData).subscribe({
      next: () => {
        this.closeModals();
        this.loadDependentsHierarchy();
        this.isProcessingAction = false;
        this.successModalConfig.message = 'El nuevo usuario ha sido registrado correctamente.';
        this.showSuccessModal = true;
      },
      error: (err: HttpErrorResponse) => {
        this.registerModalError = 'Error: ' + (err.error?.message || err.message || 'Error desconocido');
        this.isProcessingAction = false;
        console.error(err);
      }
    });
  }

  cancelRegister(): void {
    this.showConfirmationModal = false;
  }

  // --- Lógica de Ascenso/Descenso ---
  canPromote(user: Usuario): boolean {
    if (this.currentUserRole !== 'ROOT' && this.currentUserRole !== 'OWNER') return false;
    if (user.role === 'CLIENT') return true;
    if (user.role === 'SELLER') return true;
    return false;
  }

  canDemote(user: Usuario): boolean {
    if (this.currentUserRole !== 'ROOT' && this.currentUserRole !== 'OWNER') return false;
    if (user.role === 'OWNER') return true;
    if (user.role === 'MANAGER') return true;
    if (user.role === 'SELLER') return true;
    return false;
  }

  openPromoteModal(user: Usuario) {
    this.selectedUser = user;
    this.targetRole = '';
    this.modalError = '';
    this.showPromoteModal = true;
    if (user.role === 'SELLER') this.targetRole = 'MANAGER';
  }

  openDemoteModal(user: Usuario) {
    this.selectedUser = user;
    this.targetRole = '';
    this.successorId = null;
    this.potentialSuccessors = [];
    this.modalError = '';
    this.showDemoteModal = true;
  }

  onDemoteRoleChange() {
    this.modalError = "La carga de sucesores potenciales no está soportada por la API actual.";
  }

  loadPotentialSuccessors() {
    this.modalError = "La carga de sucesores potenciales no está soportada por la API actual.";
  }

  confirmPromote() {
     if (!this.targetRole) return;
     this.isProcessingAction = true;
     this.modalError = '';
     const updateData: Usuario = { ...this.selectedUser!, role: this.targetRole };
     this.userService.updateUser(this.selectedUser!.id!, updateData).subscribe({
        next: () => {
           this.closeModals();
           this.loadDependentsHierarchy();
           this.isProcessingAction = false;
           this.successModalConfig.message = 'El usuario ha sido ascendido exitosamente.';
           this.showSuccessModal = true;
        },
        error: (err: HttpErrorResponse) => {
           this.modalError = 'Error: ' + (err.error?.message || err.message || 'Error desconocido');
           this.isProcessingAction = false;
           console.error(err);
        }
     });
  }

  confirmDemote() {
    this.modalError = "La degradación de usuarios con reasignación de descendencia no está soportada por la API actual.";
    this.isProcessingAction = false;
  }

  promoteUser(user: Usuario): void { this.openPromoteModal(user); }
  demoteUser(user: Usuario): void { this.openDemoteModal(user); }
}
