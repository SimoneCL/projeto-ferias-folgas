import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipesComponent } from './equipes.component';
import { RelacEquipeEditComponent } from './relacUsuario/relac-equipe-edit.component';

const routes: Routes = [
  {
    path: '',
    component: EquipesComponent
  },
  {
    path: 'relacEquipe/:id',
    component: RelacEquipeEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EquipesRoutingModule { }