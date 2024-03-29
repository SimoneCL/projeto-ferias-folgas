import { Component, OnInit, ViewChild } from '@angular/core';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoDisclaimerGroup, PoI18nPipe, PoI18nService, PoModalAction, PoModalComponent, PoNotificationService, PoPageAction, PoPageFilter, PoTableAction, PoTableColumn } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { ITipoEvento, TipoEvento } from '../../shared/model/tipo-evento.model';
import { TipoEventoService } from '../../shared/services/tipo-evento.service';
import { UsuarioLogadoService } from '../../usuario-logado.service';

@Component({
  selector: 'app-tipo-evento',
  templateUrl: './tipo-evento.component.html'
})
export class TipoEventoComponent implements OnInit {
  @ViewChild(PoModalComponent, { static: true }) poModal: PoModalComponent;


  private tipoEventoSubscription$: Subscription;
  private disclaimers: Array<PoDisclaimer> = [];

  pageActions: Array<PoPageAction>;
  tableActions: Array<PoTableAction>;

  breadcrumb: PoBreadcrumb;
  disclaimerGroup: PoDisclaimerGroup;
  filterSettings: PoPageFilter;

  items: Array<ITipoEvento> = new Array<ITipoEvento>();
  columns: Array<PoTableColumn>;

  hasNext = false;
  pageSize = 20;
  currentPage = 0;
  isLoading = true;

  literals: any = {};
  close: PoModalAction;
  userLogado: number;

  confirm: PoModalAction;
  tipoEvento: ITipoEvento = new TipoEvento();
  isEdit: boolean = false;
  titleModal: string;
  desabilitaUtilizaFaixa: boolean;

  public usuarioLogado = new UsuarioLogadoService();

  constructor(
    private serviceTipoEvento: TipoEventoService,
    private poI18nPipe: PoI18nPipe,
    private poI18nService: PoI18nService,
    private poDialogService: PoDialogService,
    private poNotification: PoNotificationService
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
      this.setupComponents();
      this.search();
    });
  }

  private setupComponents(): void {

    this.close = {
      action: () => {
        this.closeModal();
      },
      label: this.literals.close
    };
    this.confirm = {
      action: () => {
        this.salvarTipoEvento();
      },
      label: this.literals.save
    };

    this.tableActions = [
      { action: this.edit.bind(this), label: this.literals.edit },
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
    ];

    this.pageActions = [
      {
        label: this.literals.add,
        action: () => this.onClick()
      }
    ];

    this.columns = [
      { property: 'codTipo', label: this.literals.code, width: '5%' },
      { property: 'descTipoEvento', label: this.literals.description, width: '30%', type: 'link', tooltip: this.literals.edit, action: (value, row) => this.edit(row) },
      {
        property: 'faixaData', label: this.literals.faixaData, type: 'label', labels: [{ value: 0, color: 'color-07', label: this.literals.no, tooltip: this.literals.no },
        { value: 1, color: 'color-03', label: this.literals.yes, tooltip: this.literals.yes }]
      }
    ];

    this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };

    this.filterSettings = {
      action: this.searchByDesc.bind(this),
      placeholder: this.literals.description
    };
  }

  searchByDesc(quickSearchValue: string) {

    this.disclaimers = [...[{ property: 'descTipoEvento', value: quickSearchValue }]];
    this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

  onClick() {
    this.isEdit = false;
    this.titleModal = this.literals.newEventType;
    this.tipoEvento = new TipoEvento();
    this.poModal.open();
  }
  closeModal() {
    this.poModal.close();
  }
 

  salvarTipoEvento() {
    if (this.tipoEvento.faixaData == null || this.tipoEvento.faixaData == undefined) {
      this.tipoEvento.faixaData = 0;
    }
    if (this.isEdit) {
      this.tipoEventoSubscription$ = this.serviceTipoEvento
        .update(this.tipoEvento)
        .subscribe(() => {
          this.poNotification.success(this.literals.updatedMessage);
          this.closeModal();
          this.search();

        });
    } else {
      this.tipoEventoSubscription$ = this.serviceTipoEvento
        .create(this.tipoEvento)
        .subscribe(() => {
          this.poNotification.success(this.literals.createdMessage);
          this.closeModal();
          this.search();
        });
    }


  }
  searchById(codTipo: string): void {
    this.tipoEventoSubscription$ = this.serviceTipoEvento
      .getById(codTipo,[])
      .subscribe((response: ITipoEvento) => {
        this.tipoEvento = response;
        if (this.tipoEvento.possuiEvento == 1 ) {
          this.desabilitaUtilizaFaixa = true;
        } else {
          this.desabilitaUtilizaFaixa = false;
        }
      })
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
    this.tipoEventoSubscription$ = this.serviceTipoEvento
      .query(disclaimer, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<ITipoEvento>) => {
        this.items = [...this.items, ...response.items];
        this.hasNext = response.hasNext;
        this.isLoading = false;
      });
  }

  delete(item: ITipoEvento): void {
    
    const id = TipoEvento.getInternalId(item);
    this.poDialogService.confirm({
      title: this.literals.delete,
      message: this.poI18nPipe.transform(this.literals.modalDeleteSingleMessage, [item.descTipoEvento]),
      confirm: () => {
        this.tipoEventoSubscription$ = this.serviceTipoEvento
          .delete(id)
          .subscribe(response => {
            this.poNotification.success(this.poI18nPipe.transform(this.literals.excludedMessage, item.descTipoEvento));

            this.search();
          });
      }
    });
    
  }

  private edit(item: ITipoEvento): void {
      this.isEdit = true;
      this.titleModal = this.literals.editEventType;
      this.tipoEvento = item;
      this.searchById(this.tipoEvento.codTipo.toString());
      this.poModal.open();
  }

  public onChangeDisclaimer(disclaimers): void {
    this.disclaimers = disclaimers;
    this.search();
  }

  changeValue(code: number) {
    this.confirm.disabled = !code;;
  }

  ngOnDestroy(): void {
    if (this.tipoEventoSubscription$) {
      this.tipoEventoSubscription$.unsubscribe();
    }
  }

}
