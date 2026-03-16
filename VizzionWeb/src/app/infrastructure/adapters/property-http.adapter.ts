import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropertyGateway } from '../../application/ports/property.gateway';
import { Property } from '../../models/property.model'; // Importar el modelo de dominio

@Injectable({
  providedIn: 'root'
})
export class PropertyHttpAdapter implements PropertyGateway {
  private apiUrl = 'http://localhost:8080/api/properties';

  constructor(private http: HttpClient) { }

  getAllProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(this.apiUrl);
  }

  getFeaturedProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/featured`);
  }

  getPropertyById(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  createProperty(propertyData: Property): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, propertyData);
  }

  updateProperty(id: number, propertyData: Property): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}`, propertyData);
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  deletePropertiesBatch(ids: number[]): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/batch`, { body: ids });
  }

  deleteAllProperties(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-all`);
  }

  uploadPropertyImages(propertyId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file, file.name);
    });
    return this.http.post<any>(`${this.apiUrl}/${propertyId}/images`, formData);
  }

  deletePropertyImage(imageId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/images/${imageId}`);
  }
}
