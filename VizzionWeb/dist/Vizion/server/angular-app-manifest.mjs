
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/propiedades"
  },
  {
    "renderMode": 0,
    "route": "/propiedades/*"
  },
  {
    "renderMode": 2,
    "route": "/servicios"
  },
  {
    "renderMode": 2,
    "route": "/nosotros"
  },
  {
    "renderMode": 2,
    "route": "/contacto"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/unauthorized"
  },
  {
    "renderMode": 2,
    "route": "/dashboard"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/profile"
  },
  {
    "renderMode": 2,
    "route": "/dashboard/settings"
  },
  {
    "renderMode": 2,
    "route": "/admin/users"
  },
  {
    "renderMode": 2,
    "route": "/admin/properties"
  },
  {
    "renderMode": 2,
    "route": "/admin/commissions"
  },
  {
    "renderMode": 2,
    "route": "/admin/settings"
  },
  {
    "renderMode": 2,
    "route": "/owner/team"
  },
  {
    "renderMode": 2,
    "route": "/owner/properties"
  },
  {
    "renderMode": 2,
    "route": "/owner/commissions"
  },
  {
    "renderMode": 2,
    "route": "/owner/reports"
  },
  {
    "renderMode": 2,
    "route": "/manager/sellers"
  },
  {
    "renderMode": 2,
    "route": "/manager/clients"
  },
  {
    "renderMode": 2,
    "route": "/manager/properties"
  },
  {
    "renderMode": 2,
    "route": "/manager/performance"
  },
  {
    "renderMode": 2,
    "route": "/seller/clients"
  },
  {
    "renderMode": 2,
    "route": "/seller/properties"
  },
  {
    "renderMode": 2,
    "route": "/seller/sales"
  },
  {
    "renderMode": 2,
    "route": "/seller/referrals"
  },
  {
    "renderMode": 2,
    "route": "/client/my-properties"
  },
  {
    "renderMode": 2,
    "route": "/client/purchases"
  },
  {
    "renderMode": 2,
    "route": "/client/referrals"
  },
  {
    "renderMode": 0,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 18598, hash: '07d066f11e99e054ef13f28c8406b9f8f7d80f0f4c82d2c1c7f6f02b6a7bd158', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 18290, hash: 'af38848361925158f4ab4c210adf53d9dc55310f249d773983ec590731260497', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'unauthorized/index.html': {size: 29225, hash: '6844200d8ed0315ae0b04fa3f1a1f75d8b0ba568dcba4802875eb6d6873e1774', text: () => import('./assets-chunks/unauthorized_index_html.mjs').then(m => m.default)},
    'dashboard/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/dashboard_index_html.mjs').then(m => m.default)},
    'admin/properties/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/admin_properties_index_html.mjs').then(m => m.default)},
    'owner/properties/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/owner_properties_index_html.mjs').then(m => m.default)},
    'admin/settings/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/admin_settings_index_html.mjs').then(m => m.default)},
    'owner/reports/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/owner_reports_index_html.mjs').then(m => m.default)},
    'manager/clients/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/manager_clients_index_html.mjs').then(m => m.default)},
    'manager/performance/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/manager_performance_index_html.mjs').then(m => m.default)},
    'seller/properties/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/seller_properties_index_html.mjs').then(m => m.default)},
    'client/purchases/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/client_purchases_index_html.mjs').then(m => m.default)},
    'seller/referrals/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/seller_referrals_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 22860, hash: '81b991fead389cb02cfd3642f69d2a322a987cb5af99f48a4b4b017b34c33567', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'dashboard/settings/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/dashboard_settings_index_html.mjs').then(m => m.default)},
    'admin/commissions/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/admin_commissions_index_html.mjs').then(m => m.default)},
    'owner/commissions/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/owner_commissions_index_html.mjs').then(m => m.default)},
    'manager/properties/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/manager_properties_index_html.mjs').then(m => m.default)},
    'seller/sales/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/seller_sales_index_html.mjs').then(m => m.default)},
    'client/referrals/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/client_referrals_index_html.mjs').then(m => m.default)},
    'dashboard/profile/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/dashboard_profile_index_html.mjs').then(m => m.default)},
    'owner/team/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/owner_team_index_html.mjs').then(m => m.default)},
    'seller/clients/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/seller_clients_index_html.mjs').then(m => m.default)},
    'contacto/index.html': {size: 35752, hash: 'd8389e547a6bd82b306df95e956d39b39a5541035d81b48370390d612683b5cd', text: () => import('./assets-chunks/contacto_index_html.mjs').then(m => m.default)},
    'manager/sellers/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/manager_sellers_index_html.mjs').then(m => m.default)},
    'admin/users/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/admin_users_index_html.mjs').then(m => m.default)},
    'client/my-properties/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/client_my-properties_index_html.mjs').then(m => m.default)},
    'servicios/index.html': {size: 42712, hash: 'b8d58330f223debe39110692e376ed405920b466be6e4991f28e10e04b8697a2', text: () => import('./assets-chunks/servicios_index_html.mjs').then(m => m.default)},
    'nosotros/index.html': {size: 40147, hash: 'bb031bf0586426c871ff3d02a2524aaeb3c04da58f58a113a2b871f1e355a363', text: () => import('./assets-chunks/nosotros_index_html.mjs').then(m => m.default)},
    'propiedades/index.html': {size: 147281, hash: 'd87138990f7fdf22106c980dd3d6af0f84b8ed11be996c2ecaf263a0c745768c', text: () => import('./assets-chunks/propiedades_index_html.mjs').then(m => m.default)},
    'styles-B4OYOWCV.css': {size: 1540, hash: 'OXH9g3Yoqf0', text: () => import('./assets-chunks/styles-B4OYOWCV_css.mjs').then(m => m.default)}
  },
};
