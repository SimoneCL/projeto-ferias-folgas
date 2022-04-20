import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    /*{
        path: 'eventoCancelamento',
        loadChildren: () => import('./evento-cancelamento/evento-cancelamento.module').then(m => m.EventoCancelamentoModule)
    }*/
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})

export class AppRoutingModule { }
