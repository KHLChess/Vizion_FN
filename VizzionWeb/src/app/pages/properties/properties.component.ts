import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { PropertyImagePipe } from '../../pipes/property-image.pipe';
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, PropertyImagePipe, RouterModule],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss'
})
export class PropertiesComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private route = inject(ActivatedRoute);

  isLoading = false;
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  paginatedProperties: Property[] = [];
  selectedProperty: Property | null = null;

  // Paginación
  currentPage = 1;
  pageSize = 4;
  totalPages = 0;

  // Filtros y Ordenamiento
  searchTerm: string = '';
  selectedTypes: { [key: string]: boolean } = {
    'Casa': true,
    'Departamento': true,
    'Terreno': true
  };
  maxPrice: number = 10000000;
  minPriceLimit: number = 0;
  maxPriceLimit: number = 20000000;
  sortOrder: string = 'recent';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const propertyId = params.get('id');
      console.log('ngOnInit - propertyId de la ruta:', propertyId);
      if (propertyId) {
        this.loadPropertyDetails(Number(propertyId));
      } else {
        this.loadProperties();
      }
    });
  }

  loadProperties(): void {
    console.log('loadProperties - Cargando lista de propiedades.');
    this.isLoading = true;
    this.propertyService.getAllProperties().subscribe({ // Corregido: usar getAllProperties()
      next: (properties: Property[]) => { // Tipado explícito
        this.properties = properties;
        this.calculatePriceLimits();
        this.applyFiltersAndSorting();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => { // Tipado explícito
        console.error('Error al cargar propiedades:', err);
        this.isLoading = false;
      }
    });
  }

  loadPropertyDetails(id: number): void {
    console.log('loadPropertyDetails - Cargando detalles para ID:', id);
    this.isLoading = true;
    this.propertyService.getPropertyById(id).subscribe({
      next: (property: Property) => { // Tipado explícito
        this.selectedProperty = property;
        console.log('loadPropertyDetails - Propiedad cargada:', this.selectedProperty);
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => { // Tipado explícito
        console.error('Error al cargar detalles de la propiedad:', err);
        this.isLoading = false;
        this.selectedProperty = null;
      }
    });
  }

  calculatePriceLimits(): void {
    if (this.properties.length > 0) {
      this.maxPriceLimit = Math.max(...this.properties.map(p => p.price)) * 1.1;
      this.maxPrice = this.maxPriceLimit;
    }
  }

  applyFiltersAndSorting(): void {
    // 1. Filtrar
    this.filteredProperties = this.properties.filter(property => {
      const matchesSearch = !this.searchTerm ||
        property.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(this.searchTerm.toLowerCase());

      const typeKeys = Object.keys(this.selectedTypes).filter(key => this.selectedTypes[key]);
      const matchesType = typeKeys.length === 0 || (property.type && typeKeys.includes(property.type));

      const matchesPrice = property.price <= this.maxPrice;

      return matchesSearch && matchesType && matchesPrice;
    });

    // 2. Ordenar
    this.sortProperties();

    // 3. Paginar
    this.currentPage = 1;
    this.updatePagination();
  }

  sortProperties(): void {
    switch (this.sortOrder) {
      case 'price-asc':
        this.filteredProperties.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProperties.sort((a, b) => b.price - a.price);
        break;
      case 'recent':
      default:
        // Ordenar por fecha de actualización (o creación si no hay actualización) de más nueva a más vieja
        this.filteredProperties.sort((a, b) => {
          // Manejar Date | undefined de forma segura
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime(); // Usar 0 como fallback para Date
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime(); // Usar 0 como fallback para Date
          return dateB - dateA;
        });
        break;
    }
  }

  toggleType(type: string): void {
    this.selectedTypes[type] = !this.selectedTypes[type];
    this.applyFiltersAndSorting();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProperties.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProperties = this.filteredProperties.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getPages(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTypes = {
      'Casa': true,
      'Departamento': true,
      'Terreno': true
    };
    this.maxPrice = this.maxPriceLimit;
    this.sortOrder = 'recent';
    this.applyFiltersAndSorting();
  }
}
