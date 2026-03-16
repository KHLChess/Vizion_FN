import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core'; // Importar InjectionToken
import { Property } from '../../models/property.model';

export interface PropertyGateway {
  getAllProperties(): Observable<Property[]>;
  getFeaturedProperties(): Observable<Property[]>;
  getPropertyById(id: number): Observable<Property>;
  createProperty(propertyData: Property): Observable<Property>;
  updateProperty(id: number, propertyData: Property): Observable<Property>;
  deleteProperty(id: number): Observable<any>;
  deletePropertiesBatch(ids: number[]): Observable<any>;
  deleteAllProperties(): Observable<any>;
  uploadPropertyImages(propertyId: number, files: File[]): Observable<any>;
  deletePropertyImage(imageId: number): Observable<any>;
}

// Definir el InjectionToken para PropertyGateway
export const PROPERTY_GATEWAY = new InjectionToken<PropertyGateway>('PropertyGateway');
