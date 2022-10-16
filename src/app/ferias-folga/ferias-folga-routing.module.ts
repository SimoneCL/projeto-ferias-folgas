import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
