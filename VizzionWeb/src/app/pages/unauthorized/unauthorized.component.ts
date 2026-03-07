import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './unauthorized.component.html', // Referenciar archivo HTML
  styleUrl: './unauthorized.component.scss' // Referenciar archivo SCSS
})
export class UnauthorizedComponent { }
