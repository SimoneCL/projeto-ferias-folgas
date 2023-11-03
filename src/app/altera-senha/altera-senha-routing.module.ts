import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlteraSenhaComponent } from './altera-senha.component';

const routes: Routes = [
  {
    path: ':id',
    component: AlteraSenhaComponent    
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlteraSenhaRoutingModule { }