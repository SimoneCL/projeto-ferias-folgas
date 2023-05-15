import { Component, OnInit, ViewChild } from '@angular/core';
import { PoDialogService, PoNotificationService, PoDisclaimer, PoI18nService, PoSelectOption, PoTableAction, PoBreadcrumb, PoDisclaimerGroup, PoPageFilter, PoI18nPipe } from '@po-ui/ng-components';
import { forkJoin, observable, Subscription } from 'rxjs';
import { TotvsResponse } from 'dts-backoffice-util';
import { Feriados, IFeriados } from '../shared/model/feriados.model';
import { FeriadosService } from '../shared/services/feriados.service';
import { NgForm } from '@angular/forms';
import { PoModalAction, PoModalComponent } from '@po-ui/ng-components';
import { PoPageAction } from '@po-ui/ng-components';
import { PoTableColumn } from '@po-ui/ng-components';
import { EventoService } from '../shared/services/evento.service';
import { IFeriadosNacionais } from '../shared/model/feriados-nacionais.model';
import { IUsuario } from '../shared/model/usuario.model';
import { UsuarioService } from '../shared/services/usuario.service';
import { Evento, IEvento } from '../shared/model/evento.model';

@Component({
  selector: 'app-feriados',
  templateUrl: './feriados.component.html'
})
export class FeriadosComponent implements OnInit {
  @ViewChild('modalFeriado', { static: false }) modalFeriado: PoModalComponent;
  @ViewChild('modalFeriadosNacionais', { static: false }) modalFeriadosNacionais: PoModalComponent;
  @ViewChild('formFeriados', { static: false }) formFeriados: NgForm;

  confirm: PoModalAction;
  close: PoModalAction;
  confirmNacionais: PoModalAction;
  closeNacionais: PoModalAction;

  titleApp: String;
  email: string = undefined;
  isSubscribed: boolean = false;
  literals: any = {};
  data: string;
  descricao: string;
  tipoFeriado: string;
  pontoFacultativo: boolean;
  userLogado: string;

  filterSettings: PoPageFilter;
  breadcrumb: PoBreadcrumb;
  disclaimerGroup: PoDisclaimerGroup;
  columnsFeriados: Array<PoTableColumn>;
  tableActions: Array<PoTableAction>;

  typeOptions: Array<PoSelectOption> = [];
  feriados: IFeriados = new Feriados();

  public itemsFeriados: Array<IFeriados> = new Array<IFeriados>();

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  event: string;
  isEdit: boolean = true;

  anoOptions: Array<PoSelectOption> = [];
  anoFeriado: number;
  itemFeriadosNacionais: Array<IFeriadosNacionais> = new Array<IFeriadosNacionais>();
  servFeriadosSubscription$: Subscription;

  private usuarioSubscription$: Subscription;
  private eventoUserSubscription$: Subscription;
  public items: Array<IUsuario> = new Array<IUsuario>();
  public eventUser: Array<IEvento> = new Array<IEvento>();
  public eventUserAux: Array<IEvento> = new Array<IEvento>();

  isLoading = true;

  eventoMap = new Map();

  constructor(
    private poI18nService: PoI18nService,
    private servFeriados: FeriadosService,
    private poDialogService: PoDialogService,
    private PoI18nPipe: PoI18nPipe,
    private poNotification: PoNotificationService,
    private serviceEvento: EventoService,
    private serviceUsuario: UsuarioService
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
    })
  }
  setupComponents() {

    this.confirm = {
      action: () => {
        this.saveFeriados();
      },
      label: this.literals.save
    };

    this.close = {
      action: () => this.closeModal(),
      label: this.literals.cancel
    };

    this.confirmNacionais = {
      action: () => {
        this.saveFeriadosNacionais();
      },
      label: this.literals.save
    };

    this.closeNacionais = {
      action: () => this.closeModalNacionais(),
      label: this.literals.cancel
    };

    this.tableActions = [
      { action: this.edit.bind(this), label: this.literals.edit },
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
    ];

    this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };

    const data = new Date(Date.now());
    for (let y = 0; y <= 3; y++) {
      let yearCalc = this.getYear(data, y);
      this.anoOptions = [...this.anoOptions, { label: `${yearCalc}`, value: yearCalc }]
    }
    this.typeOptions = [
      { label: 'Municipal', value: 'Municipal' },
      { label: 'Estadual', value: 'Estadual' },
      { label: 'Nacional', value: 'Nacional' }
    ];

    this.columnsFeriados = [
      { property: 'data', label: 'Data', type: 'string' },
      { property: 'tipoFeriaDo', label: 'Tipo Feriado', type: 'string' },
      { property: 'descricao', label: 'Descrição', type: 'string' },
      { property: 'pontoFacultativo', label: 'Facultativo', type: 'boolean' }
    ];

    this.pontoFacultativo = false;

    this.filterSettings = {
      action: this.searchByDate.bind(this),
      placeholder: this.literals.description
    };

  }
  private getYear(data: Date, i: number): number {
    const d = new Date(data),

      year = d.getFullYear() + i;

    return year;
  }

  searchByDate(quickSearchValue: string) {
    this.disclaimers = [...[{ property: 'descricao', value: quickSearchValue }]];
    this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

 

  public onChangeDisclaimer(disclaimers): void {
    this.disclaimers = disclaimers;
    this.search();
  }

  search(loadMore = false): void {
    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;
    }

    this.hasNext = false;
    this.servFeriadosSubscription$ = this.servFeriados
      .query(this.disclaimers || [], this.expandables, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IFeriados>) => {
        if (response && response.items) {

          this.itemsFeriados = [...response.items];
          for (const i in response.items) {
            this.itemsFeriados[i].data = Feriados.formatoDataList(response.items[i].data);

          }
          this.hasNext = response.hasNext;
        }
      })
  }

  public readonly actions: Array<PoPageAction> = [
    { label: 'Novo', action: this.newferiados.bind(this) },
    { label: 'Gerar feriados nacionais', action: this.openModalferiadosNacionais.bind(this) }
  ];

  delete(item: IFeriados): void {

    this.poDialogService.confirm({
      title: this.literals.delete,
      message: this.PoI18nPipe.transform(this.literals.modalDeleteMessage, [item.data]),
      confirm: () => {
        this.servFeriadosSubscription$ = this.servFeriados
          .delete(item.idFeriado)
          .subscribe(response => {
            this.poNotification.success(this.literals.excludedMessage);
            this.search();
          });
      }
    });
  }

  public openModalferiadosNacionais() {
    this.modalFeriadosNacionais.open();
  }

  public closeModalNacionais() {
    this.modalFeriadosNacionais.close();
  }
  public newferiados() {
    this.isEdit = false;
    this.feriados = new Feriados();
    this.modalFeriado.open();
  }
  private edit(item: IFeriados): void {
    this.isEdit = true;
    this.feriados = new Feriados();
    this.feriados = item;
    this.feriados.dataFormat = Feriados.formataData(item.data);
    this.modalFeriado.open();
  }

  public closeModal() {
    this.modalFeriado.close();
  }

  changeEvent(event: string) {
    this.event = event;
  }

  searchByDesc(quickSearchValue: string) {

    this.disclaimers = [...[{ property: 'tipoFeriado', value: quickSearchValue }]];
    this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

  // public feriadosNacionais() {
  //   this.openModalferiadosNacionais();
  // }
  onChangeYear() {

    this.servFeriadosSubscription$ = this.servFeriados.getHoliday('2023')
      .subscribe(response => {
        this.itemFeriadosNacionais = [...response];
        this.searchUsuarios();
      });
  }
  searchUsuarios(loadMore = false) {

    this.isLoading = true;
    this.usuarioSubscription$ = this.serviceUsuario
      .query([], 1, 99999)
      .subscribe((response: TotvsResponse<IUsuario>) => {
        this.items = response.items;
        let evento = [];
        this.eventUser = [];
        this.items.forEach((user, index) => {

          this.itemFeriadosNacionais.forEach(feriados => {
            evento = [{
              "idUsuario": user.idUsuario,
              "dataEventoIni": feriados.date,
              "dataEventoFim": feriados.date,
              "codTipo": 6
            }];
            this.eventUser = [...this.eventUser, ...evento];

          });

        });
        this.hasNext = response.hasNext;
        this.isLoading = false;
      });
  }


  public saveFeriadosNacionais() {
    this.poNotification.success(this.literals.createdMessage);
    this.closeModalNacionais();
  }
  public saveFeriados() {
    this.feriados.data = this.feriados.dataFormat;
    if (this.isEdit) {
      this.servFeriadosSubscription$ = this.servFeriados
        .update(this.feriados)
        .subscribe(() => {
          this.poNotification.success(this.literals.updatedMessage);
          this.modalFeriado.close();
          this.search();
        });
    } else {
      this.servFeriadosSubscription$ = this.servFeriados
        .create(this.feriados)
        .subscribe(() => {
          this.poNotification.success(this.literals.createdMessage);
          this.modalFeriado.close();
          this.saveFeriado();
          this.search();
        });
    }
  }
  public saveFeriado() {
    let evento = {
      "idUsuario": 63380,
      "dataEventoIni": this.feriados.data,
      "dataEventoFim": this.feriados.data,
      "type": 6,
      "id": Math.floor(Math.random() * 65536)
    };
    // this.eventoUserSubscription$ = this.serviceEvento.create(evento).subscribe(() => {
    // });
  }

  ngOnDestroy(): void {
    if (this.servFeriadosSubscription$) {
      this.servFeriadosSubscription$.unsubscribe();
    }
  }
}