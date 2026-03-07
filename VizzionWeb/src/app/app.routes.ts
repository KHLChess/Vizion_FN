import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ServicesComponent } from './pages/services/services.component';
import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

import { DashboardComponent } from './pages/dashboards/dashboard/dashboard.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

import { ProfileComponent } from './pages/profile/profile.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';
import { PropertyManagementComponent } from './pages/admin/property-management/property-management.component';
import { CommissionManagementComponent } from './pages/admin/commission-management/commission-management.component';
import { SettingsManagementComponent } from './pages/admin/settings-management/settings-management.component';
import { AdvancedSettingsComponent } from './pages/admin/advanced-settings/advanced-settings.component'; // Importar AdvancedSettingsComponent
import { UserPanelComponent } from './pages/user-panel/user-panel.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  // Rutas de propiedades: la específica debe ir antes que la general
  { path: 'propiedades/:id', component: PropertiesComponent },
  { path: 'propiedades', component: PropertiesComponent },
  { path: 'servicios', component: ServicesComponent },
  { path: 'nosotros', component: AboutComponent },
  { path: 'contacto', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROOT', 'OWNER', 'MANAGER', 'SELLER', 'CLIENT'] }
  },

  // Ruta para Mi Perfil
  {
    path: 'dashboard/profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROOT', 'OWNER', 'MANAGER', 'SELLER', 'CLIENT'] }
  },
  {
    path: 'dashboard/settings',
    component: AdvancedSettingsComponent, // Corregido: apunta a AdvancedSettingsComponent
    canActivate: [AuthGuard],
    data: { roles: ['ROOT'], title: 'Configuración Avanzada', description: 'Ajustes técnicos y de seguridad del sistema.' }
  },

  // Rutas para ROOT
  {
    path: 'admin/users',
    component: UserManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROOT'] }
  },
  {
    path: 'admin/properties',
    component: PropertyManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROOT'] }
  },
  {
    path: 'admin/commissions',
    component: CommissionManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROOT', 'OWNER', 'MANAGER'] }
  },
  {
    path: 'admin/settings',
    component: SettingsManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROOT', 'OWNER'] }
  },

  // Rutas para OWNER
  {
    path: 'owner/team',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['OWNER', 'ROOT'], title: 'Gestión de Equipo', description: 'Administra gerentes y vendedores.' }
  },
  {
    path: 'owner/properties',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['OWNER', 'ROOT'], title: 'Propiedades del Dueño', description: 'Ver y gestionar todas las propiedades.' }
  },
  {
    path: 'owner/commissions',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['OWNER', 'ROOT'], title: 'Autorizar Comisiones', description: 'Revisa y autoriza el pago de comisiones.' }
  },
  {
    path: 'owner/reports',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['OWNER', 'ROOT'], title: 'Reportes de Ventas', description: 'Accede a informes detallados de ventas.' }
  },

  // Rutas para MANAGER
  {
    path: 'manager/sellers',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['MANAGER', 'OWNER', 'ROOT'], title: 'Gestión de Vendedores', description: 'Administra a los vendedores bajo tu cargo.' }
  },
  {
    path: 'manager/clients',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['MANAGER', 'OWNER', 'ROOT'], title: 'Gestión de Clientes', description: 'Administra la cartera de clientes.' }
  },
  {
    path: 'manager/properties',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['MANAGER', 'OWNER', 'ROOT'], title: 'Asignar Propiedades', description: 'Asigna propiedades a los vendedores.' }
  },
  {
    path: 'manager/performance',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['MANAGER', 'OWNER', 'ROOT'], title: 'Reportes de Rendimiento', description: 'Supervisa el rendimiento de tu equipo.' }
  },

  // Rutas para SELLER
  {
    path: 'seller/clients',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['SELLER', 'MANAGER', 'OWNER', 'ROOT'], title: 'Mis Clientes', description: 'Gestiona tus clientes asignados.' }
  },
  {
    path: 'seller/properties',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['SELLER', 'MANAGER', 'OWNER', 'ROOT'], title: 'Mis Propiedades', description: 'Consulta las propiedades que tienes asignadas.' }
  },
  {
    path: 'seller/sales',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['SELLER', 'MANAGER', 'OWNER', 'ROOT'], title: 'Mis Ventas', description: 'Historial de tus ventas realizadas.' }
  },
  {
    path: 'seller/referrals',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['SELLER', 'MANAGER', 'OWNER', 'ROOT'], title: 'Mis Referidos', description: 'Gestiona a las personas que has referido.' }
  },

  // Rutas para CLIENT
  {
    path: 'client/my-properties',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CLIENT', 'SELLER', 'MANAGER', 'OWNER', 'ROOT'], title: 'Mis Propiedades', description: 'Consulta las propiedades que te interesan o has adquirido.' }
  },
  {
    path: 'client/purchases',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CLIENT', 'SELLER', 'MANAGER', 'OWNER', 'ROOT'], title: 'Historial de Compras', description: 'Revisa tus compras anteriores.' }
  },
  {
    path: 'client/referrals',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CLIENT', 'SELLER', 'MANAGER', 'OWNER', 'ROOT'], title: 'Mis Referidos', description: 'Gestiona a las personas que has referido.' }
  },

  { path: '**', redirectTo: '' }
];
