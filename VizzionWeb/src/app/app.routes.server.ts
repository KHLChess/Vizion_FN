import { RenderMode, ServerRoute } from '@angular/ssr';
import { routes } from './app.routes';

const serverRoutes: ServerRoute[] = routes.map(route => {
  // Para rutas estáticas (sin ':' y no '**'), habilitar pre-renderizado.
  if (route.path && !route.path.includes(':') && route.path !== '**') {
    return {
      path: route.path,
      renderMode: RenderMode.Prerender,
    };
  }

  // Para todas las demás rutas (dinámicas y comodín),
  // deshabilitar el pre-renderizado y usar SSR bajo demanda.
  return {
    path: route.path || '',
    renderMode: RenderMode.Server,
  };
});

export { serverRoutes };
