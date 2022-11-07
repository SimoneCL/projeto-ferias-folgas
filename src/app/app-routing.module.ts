import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'login',
        loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
    },
    {
        path: 'feriasFolga',
        loadChildren: () => import('./ferias-folga/ferias-folga.module').then(m => m.FeriasFolgaModule)
    },
    {
        path: 'agendaUser',
        loadChildren: () => import('./agendamento-user/agendamento-user.module').then(m => m.AgendamentoUserModule)
    },
    {
        path: 'tipoEvento',
        loadChildren: () => import('./tipo-evento/tipo-evento.module').then(m => m.TipoEventoModule)
    }
    
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})

export class AppRoutingModule { }
