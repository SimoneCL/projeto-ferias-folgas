import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
    },
    {
        path: 'ferias-folga',
        loadChildren: () => import('./ferias-folga/ferias-folga.module').then(m => m.FeriasFolgaModule)
    },
    {
        path: 'calendario',
        loadChildren: () => import('./calendario/calendario.module').then(m => m.CalendarioModule)
    },
    {
        path: 'feriados',
        loadChildren: () => import('./feriados/feriados.module').then(m => m.FeriadosModule)
    },
    {
        path: 'equipes',
        loadChildren: () => import('./equipes/equipes.module').then(m => m.EquipesModule)
    }    
    
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})

export class AppRoutingModule { }
