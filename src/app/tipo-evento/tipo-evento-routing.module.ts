import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoEventoComponent } from './list/tipo-evento.component';

const routes: Routes = [
  {
    path: '',
    component: TipoEventoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TipoEventoRoutingModule { }
