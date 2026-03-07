import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [CommonModule, FormsModule], // Añadir FormsModule
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss'
})
export class UserPanelComponent implements OnInit {
  title: string = 'Panel de Usuario';
  description: string = 'Contenido específico para este panel.';

  dependents: any[] = [];
  filteredDependents: any[] = [];
  searchTerm: string = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Obtener los datos de la ruta activa
    this.route.data.subscribe(data => {
      this.title = data['title'] || 'Panel de Usuario';
      this.description = data['description'] || 'Contenido específico para este panel.';
    });

    this.loadDependentsHierarchy();
  }

  loadDependentsHierarchy(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.isLoading = true;
      this.userService.getDependentsHierarchy(userId).subscribe({
        next: (data) => {
          this.dependents = data;
          this.filterDependents(); // Filtrar después de cargar
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar la jerarquía de dependientes:', err);
          this.isLoading = false;
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
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
  }
}
