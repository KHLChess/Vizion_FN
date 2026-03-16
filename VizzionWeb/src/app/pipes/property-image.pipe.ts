import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Property } from '../models/property.model'; // Importar el modelo Property

@Pipe({
  name: 'propertyImage',
  standalone: true
})
export class PropertyImagePipe implements PipeTransform {

  private readonly IMAGE_API_BASE_URL = 'http://localhost:8080/api/images'; // URL base de la API de imágenes

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: Property | number | undefined, placeholder: string = 'assets/images/placeholder-property.jpg'): SafeUrl {
    // console.log('PropertyImagePipe - Valor recibido:', value); // LOG: Ver qué tipo de valor llega

    let imageId: number | undefined;

    // Caso 1: Recibe un objeto Property
    if (typeof value === 'object' && value !== null && 'imageIds' in value && Array.isArray(value.imageIds) && value.imageIds.length > 0) {
      imageId = value.imageIds[0]; // Tomar el primer ID de imagen
      // console.log('PropertyImagePipe - Objeto Property. Usando primer imageId:', imageId); // LOG
    }
    // Caso 2: Recibe directamente un imageId (number)
    else if (typeof value === 'number') {
      imageId = value;
      // console.log('PropertyImagePipe - Recibido imageId directamente:', imageId); // LOG
    }

    if (imageId) {
      const imageUrl = `${this.IMAGE_API_BASE_URL}/${imageId}`;
      // console.log('PropertyImagePipe - URL generada:', imageUrl); // LOG
      return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
    }

    // console.log('PropertyImagePipe - Usando placeholder:', placeholder); // LOG
    return this.sanitizer.bypassSecurityTrustUrl(placeholder);
  }
}
