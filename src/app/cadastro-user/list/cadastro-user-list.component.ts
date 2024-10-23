import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoDisclaimerGroup, PoI18nPipe, PoI18nService, PoNotificationService, PoPageAction, PoPageFilter, PoTableAction, PoTableColumn, PoTableColumnLabel } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { Evento, IEvento } from '../../shared/model/evento.model';
import { IUsuario, Usuario } from '../../shared/model/usuario.model';
import { UsuarioService } from '../../shared/services/usuario.service';
import { ITipoPerfilUsuario, TipoPerfilUsuario } from 'src/app/shared/model/tipo-perfil-usuario.model';
import { TipoPerfilUsuarioService } from 'src/app/shared/services/tipo-perfil-usuario.service';
import { UsuarioLogadoService } from '../../usuario-logado.service';

@Component({
  selector: 'app-cadastro-user-list',
  templateUrl: './cadastro-user-list.component.html',
  styleUrls: ['./cadastro-user-list.component.css']
})
export class CadastroUserListComponent implements OnInit {

  private usuarioSubscription$: Subscription;
  private servTipoPerfilUsuarioSubscription$: Subscription;
  private disclaimers: Array<PoDisclaimer> = [];

  pageActions: Array<PoPageAction> = [];
  tableActions: Array<PoTableAction> = [];

  usuarioTipo: Array<PoTableColumnLabel> = [];
  public itemsPerfil: Array<ITipoPerfilUsuario> = new Array<ITipoPerfilUsuario>();


  breadcrumb: PoBreadcrumb;

  public items: Array<IUsuario> = []; //= new Array<IUsuario>();
  columns: Array<PoTableColumn> = [];

  disclaimerGroup: PoDisclaimerGroup;
  userLogado: number;
  public usuarioLogado = new UsuarioLogadoService();
  filterSettings: PoPageFilter;
  
  hasNext = false;
  pageSize = 20;
  currentPage = 0;
  isLoading = true;

  literals: any = {};

  constructor(
    private serviceUsuario: UsuarioService,
    private poI18nPipe: PoI18nPipe,
    private poI18nService: PoI18nService,
    private poDialogService: PoDialogService,
    private poNotification: PoNotificationService,
    private router: Router,
    private servTipoPerfilUsuario: TipoPerfilUsuarioService
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
      this.searchPerfil();
      this.search();
    });
  }

  private setupComponents(): void {
    this.tableActions = [
      { action: this.edit.bind(this), label: this.literals.edit },
      { action: this.detail.bind(this), label: this.literals.detail },
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
    ];
    this.pageActions = [
      {
        label: this.literals.add,
        action: () => this.router.navigate(['cadastroUser/new'])
      }
    ];

    for (let i in this.itemsPerfil) {
      this.usuarioTipo.push(
        { value: this.itemsPerfil[i].idTipoPerfil, label: this.itemsPerfil[i].descricaoPerfil },
      );
    }
    this.columns = [
      {
        property: 'nomeUsuario', label: this.literals.usuario, type: 'link',tooltip: this.literals.edit, action: (value, row) => {
          this.edit(row);
        }
      },
      { property: 'email', label: this.literals.email, type: 'string' },
      {
        property: 'tipoPerfil', label: this.literals.perfil, type: 'label', labels: this.usuarioTipo
      },
      {
        property: 'usuarioSubstituto', label: this.literals.substituto, type: 'string'
      },
      {
        property: 'detail', type: 'detail', detail: {
          columns: [
            { property: 'equipe', label: 'Equipe' }
          ],
          typeHeader: 'top'
        }
      }
    ];



    this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };

    this.filterSettings = {
      action: this.searchByName.bind(this),
      placeholder: this.literals.description
    };
  }

  searchByName(quickSearchValue: string) {

    this.disclaimers = [...[{ property: 'nomeUsuario', value: quickSearchValue }]];
    this.disclaimerGroup.disclaimers = [...this.disclaimers];

  }
  

  search(loadMore = false): void {
    
    const disclaimer = this.disclaimers || [];
    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.items = [];
      this.currentPage = 1;
    }

    this.isLoading = true;
    this.usuarioSubscription$ = this.serviceUsuario
      .query(disclaimer, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IUsuario>) => {
        this.items = response.items;
        this.hasNext = response.hasNext;
        this.isLoading = false;
      });
  }

  delete(item: IUsuario): void {
    const id = Usuario.getInternalId(item);
    this.poDialogService.confirm({
      title: this.literals.delete,
      message: this.poI18nPipe.transform(this.literals.modalDeleteSingleMessage, [item.nomeUsuario]),
      confirm: () => {
        this.usuarioSubscription$ = this.serviceUsuario

          .delete(id)
          .subscribe(response => {
            this.router.navigate(['/cadastroUser']);
            this.poNotification.success(this.poI18nPipe.transform(this.literals.excludedMessage, item.nomeUsuario));

            this.search();
          });
      }
    });
  }

  getIcons(strTooltip: string): any[] {
    return [
      { value: true, icon: 'ph ph-check', color: 'color-11', tooltip: strTooltip },
      { value: false, icon: 'ph ph-minus', color: 'color-07', tooltip: `${this.literals.no} ${strTooltip}` }
    ];
  }

  private edit(item: IUsuario): void {
    this.router.navigate(['/cadastroUser', 'edit', Usuario.getInternalId(item)]);
  }

  private detail(item: IUsuario): void {
    this.router.navigate(['/cadastroUser', 'detail', Usuario.getInternalId(item)]);
  }

  public onChangeDisclaimer(disclaimers): void {
    this.disclaimers = disclaimers;
    this.search();

  }
  

  searchPerfil(): void {
    this.currentPage = 1;

    this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
      .query([], [], this.currentPage, 9999)
      .subscribe((response: TotvsResponse<ITipoPerfilUsuario>) => {
        if (response && response.items) {
          this.itemsPerfil = [...response.items];
          this.setupComponents();
          this.hasNext = response.hasNext;
        }

      })
  }


  ngOnDestroy(): void {
    if (this.usuarioSubscription$) {
      this.usuarioSubscription$.unsubscribe();
    }
  }
}
