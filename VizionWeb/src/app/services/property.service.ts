import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = 'http://localhost:8080/api/properties';

  constructor(private http: HttpClient) { }

  getAllProperties(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getProperties(): Observable<any[]> {
    return this.getAllProperties();
  }

  getFeaturedProperties(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/featured`);
  }

  getPropertyById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createProperty(propertyData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, propertyData);
  }

  updateProperty(id: number, propertyData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, propertyData);
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
