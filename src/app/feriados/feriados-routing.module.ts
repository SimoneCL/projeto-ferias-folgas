import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeriadosComponent } from './feriados.component';

const routes: Routes = [
  {
    path: '',
    component: FeriadosComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeriadosRoutingModule { }