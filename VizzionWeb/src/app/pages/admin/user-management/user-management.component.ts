import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, catchError, concatMap, tap, finalize, toArray, filter } from 'rxjs/operators';
import { Subject, of, from, Observable, throwError } from 'rxjs';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  allRoles: string[] = ['OWNER', 'MANAGER', 'SELLER', 'CLIENT', 'REFERIDO'];
  availableRoles: string[] = [];
  selectedUser: any = null;
  originalUser: any = null;
  isEditing = false;
  isCreating = false;
  isOperationBlocked = false;
  isDegradingWithoutClients = false;
  isReassigning = false;

  newUser: any = {
    username: '', email: '', password: '', fullName: '', role: 'CLIENT', managedById: null, referrerId: null
  };
  errorMessage: string | null = null;
  successMessage: string | null = null;

  managableUsers: any[] = [];
  clientUsers: any[] = [];
  potentialReferrers: any[] = [];

  usernameAvailability: boolean | null = null;
  emailAvailability: boolean | null = null;
  private usernameChanged: Subject<string> = new Subject<string>();
  private emailChanged: Subject<string> = new Subject<string>();

  showDeleteModal = false;
  userToDeleteId: number | null = null;

  showReassignmentModal = false;
  userToReassign: any = null;
  orphanedClients: any[] = [];
  newManagerId: number | null = null;
  availableReassignmentManagers: any[] = [];

  showCreateSuccessModal = false;
  showUpdateSuccessModal = false;
  showReassignmentSuccessModal = false;
  reassignedClients: any[] = [];
  newManagerName: string = '';

  showPromotionSuccessModal = false;
  promotedReferrals: any[] = [];
  promotedUserName: string = '';

  showDeleteAllModal = false;
  isDeletingMultiple = false;

  selectedUserIds: Set<number> = new Set();
  showDeleteSelectedModal = false;

  showDeleteSuccessModal = false; // Nuevo modal de éxito para eliminación individual
  showDeleteSelectedSuccessModal = false; // Nuevo modal de éxito para eliminación selectiva
  showDeleteAllSuccessModal = false; // Nuevo modal de éxito para eliminación masiva


  constructor(
    private userService: UserService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupValidationObservers();
  }

  setupValidationObservers(): void {
    this.usernameChanged.pipe(debounceTime(500), distinctUntilChanged(), switchMap(username => this.userService.checkUsernameAvailability(username, this.isCreating ? 0 : this.selectedUser.id).pipe(catchError(() => of(true))))).subscribe(isAvailable => { this.usernameAvailability = isAvailable; this.cdr.detectChanges(); });
    this.emailChanged.pipe(debounceTime(500), distinctUntilChanged(), switchMap(email => this.userService.checkEmailAvailability(email, this.isCreating ? 0 : this.selectedUser.id).pipe(catchError(() => of(true))))).subscribe(isAvailable => { this.emailAvailability = isAvailable; this.cdr.detectChanges(); });
  }

  loadInitialData(): void {
    this.loadUsers();
    this.loadManagableUsers();
    this.loadClientUsers();
    this.loadPotentialReferrers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.users = data.filter(user => user.role !== 'ROOT');
        this.filteredUsers = [...this.users];
        this.selectedUserIds.clear();
        this.cdr.detectChanges();
      },
      error: (err: any) => { this.errorMessage = 'No se pudieron cargar los usuarios.'; }
    });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.fullName.toLowerCase().includes(term)
      );
    }
  }

  loadManagableUsers(): void {
    this.userService.getManagers().subscribe({
      next: (data: any[]) => { this.managableUsers = data; },
      error: (err) => { console.error('Error al cargar gestores:', err); }
    });
  }

  loadClientUsers(): void {
    this.userService.getClients().subscribe({
      next: (data: any[]) => { this.clientUsers = data; },
      error: (err) => { console.error('Error al cargar clientes:', err); }
    });
  }

  loadPotentialReferrers(): void {
    this.userService.getPotentialReferrers().subscribe({
      next: (data: any[]) => { this.potentialReferrers = data; },
      error: (err) => { console.error('Error al cargar posibles referentes:', err); }
    });
  }

  onAddUser(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.selectedUser = null;
    this.originalUser = null;
    this.availableRoles = [...this.allRoles];
    this.newUser = { username: '', email: '', password: '', fullName: '', role: 'CLIENT', managedById: null, referrerId: null };
    this.clearMessages();
  }

  onEditUser(userToEdit: any): void {
    this.clearMessages();
    this.userService.getUserById(userToEdit.id).subscribe({
      next: (freshUser) => {
        this.isEditing = true;
        this.isCreating = false;
        this.selectedUser = { ...freshUser, managedById: freshUser.managedBy?.id, referrerId: freshUser.referrer?.id };
        this.originalUser = { ...this.selectedUser };
        this.updateAvailableRoles();
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = "No se pudo cargar la información más reciente del usuario."; }
    });
  }

  onCancelEdit(): void {
    this.isEditing = false;
    this.isCreating = false;
    this.selectedUser = null;
    this.originalUser = null;
    this.clearMessages();
  }

  onRoleChange(newRole: string): void {
    this.clearMessages();
    const user = this.isCreating ? this.newUser : this.selectedUser;
    user.role = newRole;

    const wasManager = this.originalUser.role && ['OWNER', 'MANAGER', 'SELLER'].includes(this.originalUser.role);
    const isNowClient = newRole === 'CLIENT';

    if (this.isEditing && wasManager && isNowClient) {
      this.handleManagerDegradation();
    }
  }

  updateAvailableRoles(): void {
    if (this.isEditing) {
      this.availableRoles = this.allRoles.filter(r => r !== 'OWNER' && r !== 'REFERIDO');
    } else {
      this.availableRoles = [...this.allRoles];
    }
  }

  onSaveUser(): void {
    this.clearMessages();
    this.proceedWithUpdate();
  }

  private handleManagerDegradation(): void {
    this.availableReassignmentManagers = this.managableUsers.filter(u => u.id !== this.selectedUser.id);
    if (this.availableReassignmentManagers.length === 0) {
      this.errorMessage = "No se puede degradar al último gestor. Cree un nuevo gestor antes.";
      setTimeout(() => { this.selectedUser.role = this.originalUser.role; this.cdr.detectChanges(); }, 0);
      return;
    }
    this.userService.getClientsByManager(this.selectedUser.id).subscribe({
      next: (clients) => {
        if (clients.length > 0) {
          this.userToReassign = this.selectedUser;
          this.orphanedClients = clients;
          this.showReassignmentModal = true;
        } else {
          this.isDegradingWithoutClients = true;
          this.proceedWithUpdate();
        }
      },
      error: () => { this.errorMessage = "Error al obtener los clientes del gestor."; }
    });
  }

  onConfirmReassignment(): void {
    if (!this.newManagerId) { this.errorMessage = "Debe seleccionar un nuevo gestor."; return; }
    this.isReassigning = true;
    this.selectedUser.managedById = this.newManagerId;
    this.proceedWithUpdate();
  }

  onCancelReassignment(): void { this.selectedUser.role = this.originalUser.role; this.closeReassignmentModal(); }

  private closeReassignmentModal(): void {
    this.showReassignmentModal = false;
    this.userToReassign = null;
    this.orphanedClients = [];
    this.newManagerId = null;
    this.availableReassignmentManagers = [];
  }

  private proceedWithUpdate(): void {
    if (!this.isFormValid()) { this.errorMessage = 'Por favor, complete todos los campos requeridos y corrija los errores.'; return; }
    const userPayload = this.isCreating ? this.newUser : this.selectedUser;
    const finalPayload = { ...userPayload, managedBy: { id: userPayload.managedById }, referrer: { id: userPayload.referrerId } };
    delete finalPayload.managedById;
    delete finalPayload.referrerId;

    const operation = this.isCreating ? this.userService.createUser(finalPayload) : this.userService.updateUser(finalPayload.id, finalPayload);
    operation.subscribe({
      next: () => {
        if (this.isCreating) {
          this.showCreateSuccessModal = true;
        } else {
          // Lógica para mostrar el modal de éxito de actualización o reasignación
          if (this.isReassigning) {
            const newManager = this.managableUsers.find(u => u.id === Number(this.newManagerId));
            this.newManagerName = newManager ? newManager.fullName : 'Desconocido';
            this.reassignedClients = [...this.orphanedClients];
            this.showReassignmentSuccessModal = true;
          } else {
            this.showUpdateSuccessModal = true;
          }
        }
        this.onCancelEdit();
        this.loadInitialData();
        this.isReassigning = false;
      },
      error: (err) => {
        this.errorMessage = `No se pudo ${this.isCreating ? 'crear' : 'actualizar'} el usuario. ` + (err.error.message || '');
        this.isReassigning = false;
      }
    });
  }

  onDeleteUser(id: number): void { this.userToDeleteId = id; this.showDeleteModal = true; }
  onConfirmDelete(): void {
    if (this.userToDeleteId) {
      this.userService.deleteUser(this.userToDeleteId).subscribe({
        next: () => {
          this.showDeleteSuccessModal = true; // Mostrar modal de éxito
          this.loadInitialData();
          this.closeDeleteModal();
        },
        error: (err) => {
          this.errorMessage = 'No se pudo eliminar el usuario. ' + (err.error.message || '');
          this.closeDeleteModal();
        }
      });
    }
  }
  onCancelDelete(): void { this.closeDeleteModal(); }
  private closeDeleteModal(): void { this.showDeleteModal = false; this.userToDeleteId = null; }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.usernameAvailability = null;
    this.emailAvailability = null;
  }

  onDeleteAllUsers(): void {
    this.showDeleteAllModal = true;
  }

  onConfirmDeleteAll(): void {
    this.userService.deleteAllUsers().subscribe({
      next: () => {
        this.showDeleteAllSuccessModal = true; // Mostrar modal de éxito
        this.loadInitialData();
        this.showDeleteAllModal = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al eliminar los usuarios: ' + (err.error.message || 'Error desconocido.');
        this.showDeleteAllModal = false;
      }
    });
  }

  toggleSelection(userId: number): void {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
    } else {
      this.selectedUserIds.add(userId);
    }
  }

  toggleAllSelection(event: any): void {
    if (event.target.checked) {
      this.filteredUsers.forEach(user => this.selectedUserIds.add(user.id));
    } else {
      this.selectedUserIds.clear();
    }
  }

  isSelected(userId: number): boolean {
    return this.selectedUserIds.has(userId);
  }

  areAllSelected(): boolean {
    return this.filteredUsers.length > 0 && this.filteredUsers.every(user => this.selectedUserIds.has(user.id));
  }

  onDeleteSelected(): void {
    this.showDeleteSelectedModal = true;
  }

  onConfirmDeleteSelected(): void {
    const idsToDelete = Array.from(this.selectedUserIds);
    this.userService.deleteUsersBatch(idsToDelete).subscribe({
      next: () => {
        this.showDeleteSelectedSuccessModal = true; // Mostrar modal de éxito
        this.loadInitialData();
        this.showDeleteSelectedModal = false;
        this.selectedUserIds.clear();
      },
      error: (err) => {
        this.errorMessage = 'Error al eliminar los usuarios seleccionados: ' + (err.error.message || 'Error desconocido.');
        this.showDeleteSelectedModal = false;
      }
    });
  }

  onUsernameChange(username: string): void {
    if (this.isCreating) { this.newUser.username = username; } else if (this.selectedUser) { this.selectedUser.username = username; }
    this.usernameChanged.next(username);
  }

  onEmailChange(email: string): void {
    if (this.isCreating) { this.newUser.email = email; } else if (this.selectedUser) { this.selectedUser.email = email; }
    this.emailChanged.next(email);
  }

  isFormValid(): boolean {
    const user = this.isCreating ? this.newUser : this.selectedUser;
    if (!user) return false;
    if (!user.fullName || !user.username || !user.email || !user.role) return false;
    if (this.isCreating) {
      if (user.role !== 'REFERIDO' && !user.password) return false;
      if (this.managableUsers.length === 0 && user.role === 'CLIENT') return false;
      if (user.role === 'CLIENT' && !user.managedById) return false;
    }
    if (this.isEditing && this.originalUser.role === 'REFERIDO' && user.role !== 'REFERIDO' && !user.password) return false;
    if (user.role === 'REFERIDO' && !user.referrerId) return false;
    if (this.usernameAvailability === false || this.emailAvailability === false) return false;
    return true;
  }
}
