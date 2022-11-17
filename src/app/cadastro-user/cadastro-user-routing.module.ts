import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastroUserEditComponent } from './edit/cadastro-user-edit.component';
import { CadastroUserListComponent } from './list/cadastro-user-list.component';

const routes: Routes = [
  {
    path: '',
    component: CadastroUserListComponent
  },
  {
    path: 'new',
    component: CadastroUserEditComponent
  },
  {
    path: 'detail/:id',
    component: CadastroUserEditComponent
  },
  {
    path: 'edit/:id',
    component: CadastroUserEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CadastroUserRoutingModule { }
