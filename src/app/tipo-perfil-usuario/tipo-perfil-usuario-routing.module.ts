import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoPerfilUsuarioListComponent } from './list/tipo-perfil-usuario-list.component';
import { TipoPerfilUsuarioEditComponent } from './edit/tipo-perfil-usuario-edit.component';

const routes: Routes = [
  {
    path: '',
    component: TipoPerfilUsuarioListComponent
  },
  {
    path: 'new',
    component: TipoPerfilUsuarioEditComponent
  },
  {
    path: 'edit/:id',
    component: TipoPerfilUsuarioEditComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TipoPerfilUsuarioRoutingModule { }