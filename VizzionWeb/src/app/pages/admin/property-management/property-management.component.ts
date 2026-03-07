import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../services/property.service';
import { ReportService } from '../../../services/report.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-property-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './property-management.component.html',
  styleUrl: './property-management.component.scss'
})
export class PropertyManagementComponent implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = [];
  searchTerm: string = '';

  isLoading = false;
  isSaving = false;
  isDeleting = false;
  isGeneratingReport = false;
  isEditing = false;
  isCreating = false;

  currentProperty: any = {};
  featureInput: string = '';

  salesforceUsers: any[] = [];
  dependentUsers: any[] = [];

  selectedPropertyIds = new Set<number>();

  newImageFiles: File[] = [];
  newImagePreviews: SafeUrl[] = [];

  showDeleteModal = false;
  showDeleteSelectedModal = false;
  showDeleteAllModal = false;
  propertyToDeleteId: number | null = null;

  showSaveSuccessModal = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private propertyService: PropertyService,
    private reportService: ReportService,
    public authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.loadSalesforceUsers();
  }

  loadProperties(): void {
    this.isLoading = true;
    this.propertyService.getAllProperties().subscribe({
      next: (data) => {
        this.properties = data;
        this.filterProperties();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar propiedades.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadSalesforceUsers(): void {
    this.userService.getSalesforceUsers().subscribe({
      next: (data) => this.salesforceUsers = data,
      error: (err) => console.error('Error al cargar fuerza de ventas:', err)
    });
  }

  private loadDependents(userId: number): void {
    this.dependentUsers = [];
    if (userId) {
      this.userService.getDependents(userId).subscribe({
        next: (data) => {
          this.dependentUsers = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al cargar dependientes:', err)
      });
    }
  }

  onSoldByChange(userId: number): void {
    this.currentProperty.boughtById = null; // Limpiar comprador al cambiar el vendedor
    this.loadDependents(userId);
  }

  filterProperties(): void {
    if (!this.searchTerm) {
      this.filteredProperties = [...this.properties];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredProperties = this.properties.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term)
      );
    }
  }

  generateReport(format: 'pdf' | 'xls'): void {
    this.isGeneratingReport = true;
    this.clearMessages();
    this.reportService.downloadPropertiesReport(format).subscribe({
      next: (blob) => {
        const filename = `Reporte_Propiedades_${new Date().toISOString().slice(0,10)}.${format}`;
        saveAs(blob, filename);
        this.isGeneratingReport = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al generar el reporte.';
        this.isGeneratingReport = false;
        console.error(err);
      }
    });
  }

  onAddProperty(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.currentProperty = {
      title: '', location: '', price: 0, status: 'En Venta', type: 'Casa', description: '', beds: 0, baths: 0, area: 0, isFeatured: false, images: [], features: [],
      soldById: null, boughtById: null
    };
    this.dependentUsers = [];
    this.newImageFiles = [];
    this.newImagePreviews = [];
    this.clearMessages();
  }

  onEditProperty(property: any): void {
    console.log('Propiedad recibida para editar:', property);
    this.isEditing = true;
    this.isCreating = false;
    this.currentProperty = {
      ...property,
      features: property.features ? [...property.features] : [],
      soldById: property.soldById,
      boughtById: property.boughtById
    };
    console.log('currentProperty después de la asignación:', this.currentProperty);

    if (this.currentProperty.soldById) {
      this.loadDependents(this.currentProperty.soldById); // Cargar dependientes sin resetear el comprador
    } else {
      this.dependentUsers = [];
    }

    this.newImageFiles = [];
    this.newImagePreviews = [];
    this.clearMessages();
  }

  onCancelEdit(): void {
    this.isEditing = false;
    this.isCreating = false;
    this.currentProperty = {};
    this.dependentUsers = [];
    this.newImageFiles = [];
    this.newImagePreviews = [];
    this.clearMessages();
  }

  onSaveProperty(): void {
    if (!this.isFormValid(this.currentProperty) || this.isSaving) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      return;
    }
    this.isSaving = true;
    this.clearMessages();

    const propertyToSave = { ...this.currentProperty };
    if (this.currentProperty.soldById) {
      propertyToSave.soldBy = { id: this.currentProperty.soldById };
    }
    if (this.currentProperty.boughtById) {
      propertyToSave.boughtBy = { id: this.currentProperty.boughtById };
    }

    const operation = this.isCreating
      ? this.propertyService.createProperty(propertyToSave)
      : this.propertyService.updateProperty(this.currentProperty.id, propertyToSave);

    operation.subscribe({
      next: (savedProperty) => {
        const propertyId = this.isCreating ? savedProperty.id : this.currentProperty.id;

        if (this.newImageFiles.length > 0) {
          this.propertyService.uploadPropertyImages(propertyId, this.newImageFiles).subscribe({
            next: () => {
              this.handleSaveSuccess(`Propiedad ${this.isCreating ? 'creada' : 'actualizada'} y imágenes subidas exitosamente.`);
            },
            error: (err) => {
              this.handleSaveError(`Propiedad guardada, pero hubo un error al subir las imágenes.`, err);
            }
          });
        } else {
          this.handleSaveSuccess(`Propiedad ${this.isCreating ? 'creada' : 'actualizada'} exitosamente.`);
        }
      },
      error: (err) => {
        this.handleSaveError(`Error al ${this.isCreating ? 'crear' : 'actualizar'} la propiedad.`, err);
      }
    });
  }

  private handleSaveSuccess(message: string): void {
    this.successMessage = message;
    this.showSaveSuccessModal = true;
    this.isSaving = false;
    this.loadProperties();
    this.onCancelEdit();
  }

  private handleSaveError(message: string, error: any): void {
    this.errorMessage = message;
    this.isSaving = false;
    console.error(error);
  }

  onDeleteProperty(id: number): void {
    this.propertyToDeleteId = id;
    this.showDeleteModal = true;
  }

  onConfirmDelete(): void {
    if (this.propertyToDeleteId) {
      this.isDeleting = true;
      this.propertyService.deleteProperty(this.propertyToDeleteId).subscribe({
        next: () => {
          this.successMessage = 'Propiedad eliminada exitosamente.';
          this.loadProperties();
          this.showDeleteModal = false;
          this.isDeleting = false;
        },
        error: (err) => {
          this.errorMessage = 'Error al eliminar la propiedad.';
          this.showDeleteModal = false;
          this.isDeleting = false;
          console.error(err);
        }
      });
    }
  }

  onCancelDelete(): void {
    this.showDeleteModal = false;
    this.propertyToDeleteId = null;
  }

  onDeleteSelected(): void {
    this.showDeleteSelectedModal = true;
  }

  onConfirmDeleteSelected(): void {
    this.isDeleting = true;
    const ids = Array.from(this.selectedPropertyIds);
    this.propertyService.deletePropertiesBatch(ids).subscribe({
      next: () => {
        this.successMessage = `${ids.length} propiedades eliminadas exitosamente.`;
        this.loadProperties();
        this.selectedPropertyIds.clear();
        this.showDeleteSelectedModal = false;
        this.isDeleting = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al eliminar las propiedades seleccionadas.';
        this.showDeleteSelectedModal = false;
        this.isDeleting = false;
        console.error(err);
      }
    });
  }

  onDeleteAll(): void {
    this.showDeleteAllModal = true;
  }

  onConfirmDeleteAll(): void {
    this.isDeleting = true;
    this.propertyService.deleteAllProperties().subscribe({
      next: () => {
        this.successMessage = 'Todas las propiedades han sido eliminadas.';
        this.loadProperties();
        this.showDeleteAllModal = false;
        this.isDeleting = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al eliminar todas las propiedades.';
        this.showDeleteAllModal = false;
        this.isDeleting = false;
        console.error(err);
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (const file of files) {
        this.newImageFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newImagePreviews.push(this.sanitizer.bypassSecurityTrustUrl(e.target.result));
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeNewImage(index: number): void {
    this.newImageFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  removeExistingImage(imageId: number): void {
    this.propertyService.deletePropertyImage(imageId).subscribe({
      next: () => {
        this.currentProperty.images = this.currentProperty.images.filter((img: any) => img.id !== imageId);
        this.successMessage = 'Imagen eliminada exitosamente.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error al eliminar la imagen.';
        console.error(err);
      }
    });
  }

  addFeature(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.featureInput.trim()) {
      event.preventDefault();
      if (!this.currentProperty.features) {
        this.currentProperty.features = [];
      }
      this.currentProperty.features.push(this.featureInput.trim());
      this.featureInput = '';
    }
  }

  removeFeature(index: number): void {
    this.currentProperty.features.splice(index, 1);
  }

  toggleSelection(propertyId: number): void {
    if (this.selectedPropertyIds.has(propertyId)) {
      this.selectedPropertyIds.delete(propertyId);
    } else {
      this.selectedPropertyIds.add(propertyId);
    }
  }

  toggleAllSelection(event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.filteredProperties.forEach(p => this.selectedPropertyIds.add(p.id));
    } else {
      this.selectedPropertyIds.clear();
    }
  }

  isSelected(propertyId: number): boolean {
    return this.selectedPropertyIds.has(propertyId);
  }

  areAllSelected(): boolean {
    return this.filteredProperties.length > 0 && this.filteredProperties.every(p => this.selectedPropertyIds.has(p.id));
  }

  isFormValid(property: any): boolean {
    const basicValid = property.title && property.location && property.price > 0 && property.status && property.type;
    if (property.status === 'Vendido') {
      return basicValid && property.soldById && property.boughtById;
    }
    return basicValid;
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}
