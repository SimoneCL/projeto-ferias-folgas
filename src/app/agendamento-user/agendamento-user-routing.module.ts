import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendamentoUserEditComponent } from './edit/agendamento-user-edit.component';
import { AgendamentoUserListComponent } from './list/agendamento-user-list.component';

const routes: Routes = [
  {
    path: '',
    component: AgendamentoUserListComponent
  },
  {
    path: 'list/:id',
    component: AgendamentoUserListComponent
  },
  {
    path: 'new',
    component: AgendamentoUserEditComponent
  },
  {
    path: 'detail/:id',
    component: AgendamentoUserEditComponent
  },
  {
    path: 'edit/:id',
    component: AgendamentoUserEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgendamentoUserRoutingModule { }
