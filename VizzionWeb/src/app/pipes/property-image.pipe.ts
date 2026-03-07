import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'propertyImage',
  standalone: true
})
export class PropertyImagePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, placeholder: string = 'assets/images/placeholder-property.jpg'): SafeUrl {
    console.log('PropertyImagePipe - Valor recibido:', value); // LOG: Ver qué tipo de valor llega

    let imageData: string | null = null;
    let contentType: string | null = null;

    // Caso 1: Recibe un objeto Property (para la lista)
    if (value && value.images && value.images.length > 0) {
      const image = value.images[0];
      imageData = image.data;
      contentType = image.contentType;
      console.log('PropertyImagePipe - Objeto Property. Usando primera imagen:', image); // LOG
    }
    // Caso 2: Recibe un objeto de imagen individual (para la galería de detalles)
    else if (value && value.data && value.contentType) {
      imageData = value.data;
      contentType = value.contentType;
      console.log('PropertyImagePipe - Objeto de imagen individual:', value); // LOG
    }

    if (imageData && contentType) {
      const imageUrl = 'data:' + contentType + ';base64,' + imageData;
      console.log('PropertyImagePipe - URL generada:', imageUrl.substring(0, 100) + '...'); // LOG: Mostrar parte de la URL
      return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
    }

    console.log('PropertyImagePipe - Usando placeholder:', placeholder); // LOG
    return this.sanitizer.bypassSecurityTrustUrl(placeholder);
  }
}
