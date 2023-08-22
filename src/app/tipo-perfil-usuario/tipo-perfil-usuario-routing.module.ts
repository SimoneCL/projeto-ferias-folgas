import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoPerfilUsuarioListComponent } from './list/tipo-perfil-usuario-list.component';

const routes: Routes = [
  {
    path: '',
    component: TipoPerfilUsuarioListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TipoPerfilUsuarioRoutingModule { }