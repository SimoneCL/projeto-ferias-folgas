import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarioComponent } from '../calendario/calendario.component';
import { FeriasFolgaComponent } from './ferias-folga.component';

const routes: Routes = [
  {
    path: '',
    component: FeriasFolgaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeriasFolgaRoutingModule { }
