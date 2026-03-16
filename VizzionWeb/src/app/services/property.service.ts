import { Injectable, Inject } from '@angular/core'; // Importar Inject
import { Observable } from 'rxjs';
import { PropertyGateway, PROPERTY_GATEWAY } from '../application/ports/property.gateway'; // Importar PROPERTY_GATEWAY
import { Property } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  constructor(@Inject(PROPERTY_GATEWAY) private propertyGateway: PropertyGateway) { }

  getAllProperties(): Observable<Property[]> {
    return this.propertyGateway.getAllProperties();
  }

  getFeaturedProperties(): Observable<Property[]> {
    return this.propertyGateway.getFeaturedProperties();
  }

  getPropertyById(id: number): Observable<Property> {
    return this.propertyGateway.getPropertyById(id);
  }

  createProperty(propertyData: Property): Observable<Property> {
    return this.propertyGateway.createProperty(propertyData);
  }

  updateProperty(id: number, propertyData: Property): Observable<Property> {
    return this.propertyGateway.updateProperty(id, propertyData);
  }

  deleteProperty(id: number): Observable<any> {
    return this.propertyGateway.deleteProperty(id);
  }

  deletePropertiesBatch(ids: number[]): Observable<any> {
    return this.propertyGateway.deletePropertiesBatch(ids);
  }

  deleteAllProperties(): Observable<any> {
    return this.propertyGateway.deleteAllProperties();
  }

  uploadPropertyImages(propertyId: number, files: File[]): Observable<any> {
    return this.propertyGateway.uploadPropertyImages(propertyId, files);
  }

  deletePropertyImage(imageId: number): Observable<any> {
    return this.propertyGateway.deletePropertyImage(imageId);
  }
}
