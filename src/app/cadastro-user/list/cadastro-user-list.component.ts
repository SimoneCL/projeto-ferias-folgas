import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoDisclaimerGroup, PoI18nPipe, PoI18nService, PoNotificationService, PoPageAction, PoPageFilter, PoTableAction, PoTableColumn, PoTableColumnLabel } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { Evento, IEvento } from '../../shared/model/evento.model';
import { IUsuario, Usuario } from '../../shared/model/usuario.model';
import { UsuarioService } from '../../shared/services/usuario.service';

@Component({
  selector: 'app-cadastro-user-list',
  templateUrl: './cadastro-user-list.component.html',
  styleUrls: ['./cadastro-user-list.component.css']
})
export class CadastroUserListComponent implements OnInit {

  private usuarioSubscription$: Subscription;
  private disclaimers: Array<PoDisclaimer> = [];

  pageActions: Array<PoPageAction>;
  tableActions: Array<PoTableAction>;

  usuarioTipo: Array<PoTableColumnLabel>;

  breadcrumb: PoBreadcrumb;

  public items: Array<IUsuario> = new Array<IUsuario>();
  columns: Array<PoTableColumn>;
  filterSettings: PoPageFilter;
  disclaimerGroup: PoDisclaimerGroup;
  userLogado: string;


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
      this.setupComponents();
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

    this.columns = [
      {
        property: 'usuario', label: this.literals.usuario,type: 'link', action: (value, row) => {
          this.edit(row);
        }
      },
      { property: 'email', label: this.literals.email, type: 'string' },
      {
        property: 'tipoPerfil', label: this.literals.perfil, type: 'label', labels: [
          { value: '1', color: 'color-11', label: 'Team Lead' },
          { value: '2', color: 'color-08', label: 'Product Owner' },
          { value: '3', color: 'color-02', label: 'Dev Team' }]
      },
    ];


    this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };

    this.filterSettings = {
      action: this.searchById.bind(this),
      placeholder: this.literals.description
    };
  }
  
  searchById(quickSearchValue: string) {

    this.disclaimers = [...[{ property: 'usuario', value: quickSearchValue }]];
    this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

  search(loadMore = false): void {

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.items = [];
      this.currentPage = 1;
    }

    this.isLoading = true;
    this.usuarioSubscription$ = this.serviceUsuario
      .query(this.disclaimers, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IUsuario>) => {
        this.items = [...this.items, ...response.items];
        this.hasNext = response.hasNext;
        this.isLoading = false;
      });
  }

  delete(item: IUsuario): void {
    const id = Usuario.getInternalId(item);
    this.poDialogService.confirm({
      title: this.literals.remove,
      message: this.poI18nPipe.transform(this.literals.modalDeleteMessage, [item.usuario]),
      confirm: () => {
        this.usuarioSubscription$ = this.serviceUsuario
          .delete(id)
          .subscribe(response => {
            this.router.navigate(['/cadastroUser']);
            this.poNotification.success(this.literals.excludedMessage);
            this.search();
          }, (err: any) => {
            this.search();
          });
      }
    });
  }

  getIcons(strTooltip: string): any[] {
    return [
      { value: true, icon: 'po-icon-ok', color: 'color-11', tooltip: strTooltip },
      { value: false, icon: 'po-icon-minus', color: 'color-07', tooltip: `${this.literals.no} ${strTooltip}` }
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

  ngOnDestroy(): void {
    if (this.usuarioSubscription$) {
      this.usuarioSubscription$.unsubscribe();
    }
  }
}
