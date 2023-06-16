//Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
//PO-UI
import { PoDialogService, PoDisclaimer, PoI18nService, PoBreadcrumb, PoNotificationService, PoPageAction, PoTableAction, PoTableColumn, PoPageFilter, PoI18nPipe } from '@po-ui/ng-components';
import { PoPageLoginLiterals } from '@po-ui/ng-templates';
import { TotvsResponse } from 'dts-backoffice-util';
//Services
import { forkJoin, Subscription } from 'rxjs';
import { ITipoPerfilUsuario, TipoPerfilUsuario } from '../../shared/model/tipo-perfil-usuario.model';
import { TipoPerfilUsuarioService } from '../../shared/services/tipo-perfil-usuario.service';

@Component({
  selector: 'app-tipo-perfil-usuario',
  templateUrl: './tipo-perfil-usuario-list.component.html',
  styleUrls: ['./tipo-perfil-usuario-list.component.css']
})
export class TipoPerfilUsuarioListComponent implements OnInit {

  private i18nSubscription: Subscription;
  public tipoPerfilUsuario: ITipoPerfilUsuario = TipoPerfilUsuario.empty();
  itemsPerfil: Array<ITipoPerfilUsuario> = new Array<ITipoPerfilUsuario>();

  literalsI18n: PoPageLoginLiterals;
  literals: any = {};
  breadcrumb: PoBreadcrumb;
  eventPage: string;  
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  pageActions: Array<PoPageAction>;
  tableActions: Array<PoTableAction>;
  columnsPerfil: Array<PoTableColumn>;
  filterSettings: PoPageFilter;
  userLogado: string;

  hasNext = false;
  pageSize = 20;
  currentPage = 0;
  isLoading = true;

  servTipoPerfilUsuarioSubscription$: Subscription;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private poI18nPipe: PoI18nPipe,
    private poI18nService: PoI18nService,
    private servTipoPerfilUsuario: TipoPerfilUsuarioService,
    private poDialog: PoDialogService,
    private poNotification: PoNotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    
    this.userLogado = localStorage.getItem('userLogado');

    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));
                  
      this.search();
      this.setupComponents();
    });
  } 

  setupComponents() {
    this.pageActions = [
      {
        label: this.literals.add,
        action: () => this.router.navigate(['perfilUsuario/new'])
      }
    ];

    this.tableActions = [
      { action: this.edit.bind(this), label: this.literals.edit },
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
    ];

    this.columnsPerfil = [
      { property: 'idTipoPerfil', label: this.literals.perfilUsuario, type: 'link', action: (value, row) => this.edit(row) , width: '200px' },
      { property: 'descricaoPerfil', label: this.literals.descricaoPerfil, type: 'link', action: (value, row) => this.edit(row) },
    ];    
  }

  search(): void {
    this.currentPage = 1;
        
    this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
      .query(this.disclaimers || [], this.expandables, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<ITipoPerfilUsuario>) => {
        if (response && response.items) {
          this.itemsPerfil = [...response.items];
          this.hasNext = response.hasNext;             
        }
      })      
  }

  edit(valueRow) {
    this.router.navigate(['perfilUsuario/edit', valueRow.idTipoPerfil]);    
  }

  delete(tipoPerfil: ITipoPerfilUsuario) {
    this.poDialog.confirm({
      title: this.literals.remove,
      message: this.poI18nPipe.transform(this.literals.modalDeleteMessage, [tipoPerfil.descricaoPerfil]),
      confirm: () => {
        this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
          .delete(tipoPerfil.idTipoPerfil.toString())
          .subscribe((response: ITipoPerfilUsuario) => {
            this.poNotification.success(this.poI18nPipe.transform(this.literals.excludedMessage, tipoPerfil.idTipoPerfil.toString()));
            this.search();
          });
      }
    })    
  }

  ngOnDestroy(): void {
    if (this.servTipoPerfilUsuarioSubscription$) {
      this.servTipoPerfilUsuarioSubscription$.unsubscribe();
    }
  }
}
