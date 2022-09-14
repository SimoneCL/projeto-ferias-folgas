import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'login',
        loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
    },
    {
        path: 'ferias-folga',
        loadChildren: () => import('./ferias-folga/ferias-folga.module').then(m => m.FeriasFolgaModule)
    },
    {
        path: 'calendario',
        loadChildren: () => import('./calendario/calendario.module').then(m => m.CalendarioModule)
    }
    
    
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})

export class AppRoutingModule { }
