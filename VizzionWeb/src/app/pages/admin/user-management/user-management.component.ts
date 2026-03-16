import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, catchError, concatMap, tap, finalize, toArray, filter } from 'rxjs/operators';
import { Subject, of, from, Observable, throwError } from 'rxjs';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: Usuario[] = [];
  filteredUsers: Usuario[] = [];
  searchTerm: string = '';
  allRoles: string[] = ['OWNER', 'MANAGER', 'SELLER', 'CLIENT', 'REFERIDO'];
  availableRoles: string[] = [];
  selectedUser: Usuario | null = null;
  originalUser: Usuario | null = null;
  isEditing = false;
  isCreating = false;
  isOperationBlocked = false;
  isDegradingWithoutClients = false;
  isReassigning = false;

  newUser: Usuario = {
    username: '', email: '', password: '', fullName: '', role: 'CLIENT', managedById: undefined, referrerId: undefined // Cambiado a undefined
  };
  errorMessage: string | null = null;
  successMessage: string | null = null;

  managableUsers: Usuario[] = [];
  clientUsers: Usuario[] = [];
  potentialReferrers: Usuario[] = [];

  usernameAvailability: boolean | null = null;
  emailAvailability: boolean | null = null;
  private usernameChanged: Subject<string> = new Subject<string>();
  private emailChanged: Subject<string> = new Subject<string>();

  showDeleteModal = false;
  userToDeleteId: number | null = null;

  showReassignmentModal = false;
  userToReassign: Usuario | null = null;
  orphanedClients: Usuario[] = [];
  newManagerId: number | null = null;
  availableReassignmentManagers: Usuario[] = [];

  showCreateSuccessModal = false;
  showUpdateSuccessModal = false;
  showReassignmentSuccessModal = false;
  reassignedClients: Usuario[] = [];
  newManagerName: string = '';

  showPromotionSuccessModal = false;
  promotedReferrals: Usuario[] = [];
  promotedUserName: string = '';

  showDeleteAllModal = false;
  isDeletingMultiple = false;

  selectedUserIds: Set<number> = new Set();
  showDeleteSelectedModal = false;

  showDeleteSuccessModal = false;
  showDeleteSelectedSuccessModal = false;
  showDeleteAllSuccessModal = false;


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
    this.usernameChanged.pipe(debounceTime(500), distinctUntilChanged(), switchMap(username => this.userService.checkUsernameAvailability(username, this.isCreating || !this.selectedUser ? 0 : this.selectedUser.id!).pipe(catchError(() => of(true))))).subscribe(isAvailable => { this.usernameAvailability = isAvailable; this.cdr.detectChanges(); });
    this.emailChanged.pipe(debounceTime(500), distinctUntilChanged(), switchMap(email => this.userService.checkEmailAvailability(email, this.isCreating || !this.selectedUser ? 0 : this.selectedUser.id!).pipe(catchError(() => of(true))))).subscribe(isAvailable => { this.emailAvailability = isAvailable; this.cdr.detectChanges(); });
  }

  loadInitialData(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: Usuario[]) => {
        this.users = data.filter(user => user.role !== 'ROOT');
        this.filteredUsers = [...this.users];
        this.selectedUserIds.clear();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = 'No se pudieron cargar los usuarios.';
        console.error(err);
      }
    });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        (user.username && user.username.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.fullName && user.fullName.toLowerCase().includes(term))
      );
    }
  }

  onAddUser(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.selectedUser = null;
    this.originalUser = null;
    this.availableRoles = [...this.allRoles];
    this.newUser = { username: '', email: '', password: '', fullName: '', role: 'CLIENT', managedById: undefined, referrerId: undefined }; // Cambiado a undefined
    this.clearMessages();
  }

  onEditUser(userToEdit: Usuario): void {
    this.clearMessages();
    this.userService.getUserById(userToEdit.id!).subscribe({
      next: (freshUser: Usuario) => {
        this.isEditing = true;
        this.isCreating = false;
        this.selectedUser = { ...freshUser };
        this.originalUser = { ...this.selectedUser };
        this.updateAvailableRoles();
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = "No se pudo cargar la información más reciente del usuario.";
        console.error(err);
      }
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
    if (user) {
      user.role = newRole;
    }
  }

  updateAvailableRoles(): void {
    if (this.isEditing && this.selectedUser) {
      if (this.authService.getUserRole() === 'ROOT') {
        this.availableRoles = this.allRoles.filter(r => r !== 'ROOT');
      } else {
        this.availableRoles = this.allRoles.filter(r => r !== 'OWNER' && r !== 'ROOT');
      }
    } else {
      this.availableRoles = this.allRoles.filter(r => r !== 'ROOT');
    }
  }

  onSaveUser(): void {
    this.clearMessages();
    this.proceedWithUpdate();
  }

  private handleManagerDegradation(): void {
    this.errorMessage = "La degradación de gestores con reasignación de clientes no está soportada por la API actual.";
  }

  onConfirmReassignment(): void {
    this.errorMessage = "La reasignación de clientes no está soportada por la API actual.";
  }

  onCancelReassignment(): void {
    this.closeReassignmentModal();
  }

  private closeReassignmentModal(): void {
    this.showReassignmentModal = false;
    this.userToReassign = null;
    this.orphanedClients = [];
    this.newManagerId = null;
    this.availableReassignmentManagers = [];
  }

  private proceedWithUpdate(): void {
    if (!this.isFormValid()) { this.errorMessage = 'Por favor, complete todos los campos requeridos y corrija los errores.'; return; }
    const userPayload: Usuario = this.isCreating ? { ...this.newUser } : { ...this.selectedUser! };

    const operation = this.isCreating ? this.userService.createUser(userPayload) : this.userService.updateUser(userPayload.id!, userPayload);
    operation.subscribe({
      next: () => {
        if (this.isCreating) {
          this.showCreateSuccessModal = true;
        } else {
          if (this.isReassigning) {
            this.showReassignmentSuccessModal = true;
          } else {
            this.showUpdateSuccessModal = true;
          }
        }
        this.onCancelEdit();
        this.loadInitialData();
        this.isReassigning = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = `No se pudo ${this.isCreating ? 'crear' : 'actualizar'} el usuario. ` + (err.error?.message || 'Error desconocido.');
        this.isReassigning = false;
        console.error(err);
      }
    });
  }

  onDeleteUser(id: number): void { this.userToDeleteId = id; this.showDeleteModal = true; }
  onConfirmDelete(): void {
    if (this.userToDeleteId) {
      this.userService.deleteUser(this.userToDeleteId).subscribe({
        next: () => {
          this.showDeleteSuccessModal = true;
          this.loadInitialData();
          this.closeDeleteModal();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'No se pudo eliminar el usuario. ' + (err.error?.message || 'Error desconocido.');
          this.closeDeleteModal();
          console.error(err);
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
    this.errorMessage = "La eliminación de todos los usuarios no está soportada por la API actual.";
    this.showDeleteAllModal = false;
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
      this.filteredUsers.forEach(user => user.id && this.selectedUserIds.add(user.id));
    } else {
      this.selectedUserIds.clear();
    }
  }

  isSelected(userId: number): boolean {
    return this.selectedUserIds.has(userId);
  }

  areAllSelected(): boolean {
    return this.filteredUsers.length > 0 && this.filteredUsers.every(user => user.id && this.selectedUserIds.has(user.id));
  }

  onDeleteSelected(): void {
    this.showDeleteSelectedModal = true;
  }

  onConfirmDeleteSelected(): void {
    const idsToDelete = Array.from(this.selectedUserIds);
    this.userService.deleteUsersBatch(idsToDelete).subscribe({
      next: () => {
        this.showDeleteSelectedSuccessModal = true;
        this.loadInitialData();
        this.showDeleteSelectedModal = false;
        this.selectedUserIds.clear();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = 'Error al eliminar los usuarios seleccionados: ' + (err.error?.message || 'Error desconocido.');
        this.showDeleteSelectedModal = false;
        console.error(err);
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
      if (user.role === 'CLIENT' && !user.managedById) return false;
    }
    if (user.role === 'REFERIDO' && !user.referrerId) return false;
    if (this.usernameAvailability === false || this.emailAvailability === false) return false;
    return true;
  }
}
