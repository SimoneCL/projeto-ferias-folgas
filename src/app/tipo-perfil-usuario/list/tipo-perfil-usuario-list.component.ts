
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoDisclaimerGroup, PoI18nPipe, PoI18nService, PoLookupColumn, PoModalAction, PoModalComponent, PoNotificationService, PoPageAction, PoPageFilter, PoPageListComponent, PoTableAction, PoTableColumn } from '@po-ui/ng-components';
import { PoPageLoginLiterals } from '@po-ui/ng-templates';
import { DisclaimerUtil, TotvsResponse } from 'dts-backoffice-util';
import { Subscription, forkJoin } from 'rxjs';
import { ITipoPerfilUsuario, TipoPerfilUsuario } from '../../shared/model/tipo-perfil-usuario.model';
import { TipoPerfilUsuarioService } from '../../shared/services/tipo-perfil-usuario.service';
import { UsuarioLogadoService } from '../../usuario-logado.service';

@Component({
  selector: 'app-tipo-perfil-usuario',
  templateUrl: './tipo-perfil-usuario-list.component.html',
  styleUrls: ['./tipo-perfil-usuario-list.component.css']
})
export class TipoPerfilUsuarioListComponent implements OnInit {
  @ViewChild('poPageList', { static: true }) poPageList: PoPageListComponent;
  @ViewChild('modalTipoPerfil', { static: true }) modalTipoPerfil: PoModalComponent;
  @ViewChild('formTipoPerfilUsuario', { static: true }) formTipoPerfilUsuario: NgForm;

  private i18nSubscription: Subscription;
  public tipoPerfilUsuario: ITipoPerfilUsuario = TipoPerfilUsuario.empty();
  itemsPerfil: Array<ITipoPerfilUsuario> = new Array<ITipoPerfilUsuario>();

  literalsI18n: PoPageLoginLiterals;
  literals: any = {};
  eventPage: string;  
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  pageActions: Array<PoPageAction>;
  tableActions: Array<PoTableAction>;
  columnsPerfil: Array<PoTableColumn>;
  userLogado: number;

  breadcrumb: PoBreadcrumb;
  filterSettings: PoPageFilter;
  disclaimerGroup: PoDisclaimerGroup;
  disclaimerUtil: DisclaimerUtil;

  confirmAdvancedSearch: PoModalAction;
  cancelAdvancedSearch: PoModalAction;
  
  hasNext = false;
  pageSize = 20;
  currentPage = 0;
  isLoading = true;

  codTipoPerfil: number;
  descTipoPerfil: string;
  isEdit: boolean;

  zoomColumnsTipoPerfil: Array<PoLookupColumn>;
  tipoPerfilFilter: string;
    
  confirmTipoPerfil: PoModalAction;
  closeTipoPerfil: PoModalAction;

  servTipoPerfilUsuarioSubscription$: Subscription;

  public usuarioLogado = new UsuarioLogadoService();
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private poI18nPipe: PoI18nPipe,
    private poI18nService: PoI18nService,
    public servTipoPerfilUsuario: TipoPerfilUsuarioService,
    private poDialog: PoDialogService,
    private poNotification: PoNotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    
    this.userLogado = this.usuarioLogado.getUsuarioLogado();

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

    this.confirmTipoPerfil = {
      action: () => {
        this.saveTipoPerfilUsuario();
      },
      label: this.literals.save
    };

    this.closeTipoPerfil = {
      action: () => this.closeModal(),
      label: this.literals.cancel
    };

    this.pageActions = [
      {
        label: this.literals.add,
        action: this.addPerfil.bind(this)
      }
    ];


    this.filterSettings = {
      action: this.searchAdvById.bind(this),
      placeholder: this.literals.description
    };

    this.disclaimerGroup = {
      title: this.literals['filters'],
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };

    this.tableActions = [
      { action: this.edit.bind(this), label: this.literals.edit },
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
    ];

    this.columnsPerfil = [
      { property: 'idTipoPerfil', label: this.literals.perfilUsuario, type: 'number', width: '10%' },
      { property: 'descricaoPerfil', label: this.literals.descricaoPerfil, type: 'link', action: (value, row) => this.edit(row) },
    ];    

    this.zoomColumnsTipoPerfil = [
      { property: 'idTipoPerfil', label: this.literals.perfilUsuario, width: '30%' },
      { property: 'descricaoPerfil', label: this.literals.descricaoPerfil, width: '70%' }
    ];    
  }

  fieldFormatTipoPerfil(value) {
    return `${value.idTipoPerfil} - ${value.descricaoPerfil}`;
  }
  

  search(): void {
    this.currentPage = 1;
    this.itemsPerfil = [];
    
    this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
      .query(this.disclaimers || [], this.expandables, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<ITipoPerfilUsuario>) => {
        if (response && response.items) {
          this.itemsPerfil = [...response.items];
          this.hasNext = response.hasNext;             
        }
      })      
  }

  refreshDisclaimer(): void {
    this.disclaimers = [];
    
    // Inclui campo do filtro no Disclaimer
    this.addDisclaimer([
      { property: 'descricaoPerfil', value: this.tipoPerfilFilter }
    ]);    
  }

  addDisclaimer(disclaimerListItems: Array<PoDisclaimer>): void {
    if (!disclaimerListItems) { return; }
    
    disclaimerListItems.map(disclaimerItem => {      
      if (disclaimerItem.property !== '') {
        this.disclaimers.push(disclaimerItem);
      }
    });
    this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

  onChangeDisclaimer(disclaimers: Array<PoDisclaimer>): void {
    this.disclaimers = disclaimers;
    this.refreshFilters();
    this.search();
  }

  resetFilters(): void {
      // Inicia os Campos de Filtros
      this.tipoPerfilFilter = '';
  }

  refreshFilters(): void {
      if (!this.disclaimers || this.disclaimers.length === 0) {
          this.poPageList.clearInputSearch();
          this.resetFilters();
          return;
      }

      if (this.disclaimers.findIndex(disclaimer => disclaimer.property === 'descricaoPerfil') === -1) {
          this.poPageList.clearInputSearch();
      }
      
      // Atualizar os Campos de Filtro conforme o Disclaimer
      this.disclaimers.map(disclaimer => {
        
      });      
  }  

  searchAdvById(quickSearchValue = null): void {
    this.disclaimers = [];
    this.addDisclaimer([
      { property: 'descricaoPerfil', value: quickSearchValue }
    ]);
  }

  searchById(idTipoPerfil: string): void {
    this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
      .getById(idTipoPerfil)
      .subscribe((response: ITipoPerfilUsuario) => {
        this.tipoPerfilUsuario = response;           
      })
  } 

  addPerfil(tipoPerfil) {
    this.tipoPerfilUsuario.descricaoPerfil = '';
    this.modalTipoPerfil.open();    
  }

  closeModal() {
    this.isEdit = false;
    this.modalTipoPerfil.close();    
  }

  edit(valueRow) {
    this.isEdit = true;
    this.searchById(valueRow.idTipoPerfil);
    this.modalTipoPerfil.open();
  }

  saveTipoPerfilUsuario() {
    if(this.isEdit) {
      this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
        .update(this.tipoPerfilUsuario)
        .subscribe((response: ITipoPerfilUsuario) => {
          if(response) {
            this.poNotification.success(this.literals.updatedMessage);
            this.search();
          }          
        })
    } else {
      this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
        .create(this.tipoPerfilUsuario)
        .subscribe((response: ITipoPerfilUsuario) => {
          if(response) {            
            this.poNotification.success(this.literals.createdMessage);
            this.search();
           }          
        })
    }    
    this.modalTipoPerfil.close();
  }

  delete(tipoPerfil: ITipoPerfilUsuario) {
    this.poDialog.confirm({
      title: this.literals.delete,
      message: this.poI18nPipe.transform(this.literals.modalDeleteMessage, [tipoPerfil.descricaoPerfil]),
      confirm: () => {
        this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
          .delete(tipoPerfil.idTipoPerfil.toString())
          .subscribe((response: ITipoPerfilUsuario) => {
            this.poNotification.success(this.poI18nPipe.transform(this.literals.excludedMessage, tipoPerfil.descricaoPerfil));
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
