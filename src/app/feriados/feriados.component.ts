import { Component, OnInit, ViewChild } from '@angular/core';
import { PoDialogService, PoNotificationService, PoDisclaimer, PoI18nService, PoSelectOption, PoTableAction, PoBreadcrumb, PoDisclaimerGroup, PoPageFilter, PoI18nPipe, PoDatepickerRange } from '@po-ui/ng-components';
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
import { UsuarioLogadoService } from '../usuario-logado.service';

@Component({
  selector: 'app-feriados',
  templateUrl: './feriados.component.html'
})
export class FeriadosComponent implements OnInit {
  @ViewChild('modalAdvanceSearch', { static: true }) modalAdvanceSearch: PoModalComponent;
  @ViewChild('modalFeriado', { static: false }) modalFeriado: PoModalComponent;
  @ViewChild('modalFeriadosNacionais', { static: false }) modalFeriadosNacionais: PoModalComponent;
  @ViewChild('formFeriados', { static: false }) formFeriados: NgForm;

  confirm: PoModalAction;
  close: PoModalAction;
  confirmNacionais: PoModalAction;
  closeNacionais: PoModalAction;
  confirmAdvSearchAction: PoModalAction;
  cancelAdvSearchAction: PoModalAction;


  titleApp: String;
  titleModalFeriado: String;
  email: string = undefined;
  isSubscribed: boolean = false;
  literals: any = {};
  data: string;
  descricao: string;
  tipoFeriado: string;
  pontoFacultativo: boolean;
  
  userLogado: number;

  datePickerRangeFilter: PoDatepickerRange;
  filterSettings: PoPageFilter;
  breadcrumb: PoBreadcrumb;
  disclaimerGroup: PoDisclaimerGroup;
  columnsFeriados: Array<PoTableColumn>;
  tableActions: Array<PoTableAction>;

  typeOptions: Array<PoSelectOption> = [];
  feriados: IFeriados = new Feriados();

  public itemsFeriados: Array<IFeriados> = new Array<IFeriados>();
  public feriadosNacionais: Array<IFeriados> = new Array<IFeriados>();
  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  quickSearch: string;
  event: string;
  isEdit: boolean = true;

  anoOptions: Array<PoSelectOption> = [];
  anoFeriado: Array<number>;
  itemFeriadosNacionais: Array<IFeriadosNacionais> = new Array<IFeriadosNacionais>();
  servFeriadosSubscription$: Subscription;

  private usuarioSubscription$: Subscription;
  private eventoUserSubscription$: Subscription;
  private servFeriadosNacionaisSubscription$: Subscription;
  public items: Array<IUsuario> = new Array<IUsuario>();
  public eventUser: Array<IEvento> = new Array<IEvento>();
  public eventUserAux: Array<IEvento> = new Array<IEvento>();

  public usuarioLogado = new UsuarioLogadoService();

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


    this.confirmAdvSearchAction = {
      action: () => this.onConfirmAdvAction(), label: this.literals['search']
    };

    this.cancelAdvSearchAction = {
      action: () => this.modalAdvanceSearch.close(), label: this.literals['cancel']
    };
    this.tableActions = [
      { action: this.edit.bind(this), label: this.literals.edit },
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
    ];

   

    const data = new Date(Date.now());
    for (let y = 0; y <= 10; y++) {
      let yearCalc = this.getYear(data, y);
      this.anoOptions = [...this.anoOptions, { label: `${yearCalc}`, value: yearCalc }]
    }
    this.typeOptions = [
      { label: 'Municipal', value: 'municipal' },
      { label: 'Estadual', value: 'estadual' },
      { label: 'Nacional', value: 'nacional' }
    ];

    this.columnsFeriados = [
      { property: 'data', label: 'Data', type: 'link',tooltip: this.literals.edit, action: (value, row) => this.edit(row)   },
      { property: 'descricao', label: 'Descrição', type: 'link',tooltip: this.literals.edit, action: (value, row) => this.edit(row)   },
      { property: 'tipoFeriado', label: 'Tipo Feriado', type: 'string' },
      { property: 'pontoFacultativo', label: 'Facultativo', type: 'boolean' }
    ];
  
    this.pontoFacultativo = false;
    const dataAtual = new Date();
    const dataInicial = this.formatoProperty(`${dataAtual.getFullYear()}-01-01`, 'yyyymmdd');
    const dataFinal = this.formatoProperty(`${dataAtual.getFullYear()}-12-31`, 'yyyymmdd');
    this.datePickerRangeFilter = {
      start: dataInicial,
      end: dataFinal
    }
    this.disclaimers = [];
    this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };
    this.disclaimers = [
      { property: 'dataInicial', value: this.datePickerRangeFilter.start, label: this.formatoProperty(this.datePickerRangeFilter.start.toString(), 'ddmmyyyy') },
      { property: 'dataFinal', value: this.datePickerRangeFilter.end, label: this.formatoProperty(this.datePickerRangeFilter.end.toString(), 'ddmmyyyy') }];
    this.disclaimerGroup.disclaimers = [...this.disclaimers];
    
    this.filterSettings = {
      action: this.searchByDescricao.bind(this),
      advancedAction: this.advancedSearch.bind(this),
      placeholder: this.literals.description
    };


  }
  advancedSearch(): void {
     this.modalAdvanceSearch.open();
  }

  onConfirmAdvAction(): void {

    this.disclaimers = [
      { property: 'dataInicial', value: this.datePickerRangeFilter.start, label: this.formatoProperty(this.datePickerRangeFilter.start.toString(), 'ddmmyyyy') },
      { property: 'dataFinal', value: this.datePickerRangeFilter.end, label: this.formatoProperty(this.datePickerRangeFilter.end.toString(), 'ddmmyyyy') }
    ];

    this.disclaimerGroup.disclaimers = [...this.disclaimers];
    this.search();
    this.modalAdvanceSearch.close();

  }

  private getYear(data: Date, i: number): number {
    const d = new Date(data),

      year = d.getFullYear() + i;

    return year;
  }

  searchByDescricao(quickSearchValue: string) {
    this.disclaimers = [...this.disclaimers,...[{ property: 'descricao', value: quickSearchValue }]];
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
            if (response.items[i].pontoFacultativo == 0){  //esse tratamento foi feito devido o tipo lógico no mysql estar como tinyint 0 -falso e 1-verdadeiro
              this.itemsFeriados[i].pontoFacultativo = false;
            } else {
              this.itemsFeriados[i].pontoFacultativo = true;
            }
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
      message: this.PoI18nPipe.transform(this.literals.modalDeleteSingleMessage, [item.data + ' (' + item.descricao+ ')'] ),
      confirm: () => {
        this.servFeriadosSubscription$ = this.servFeriados
          .delete(item.idFeriado)
          .subscribe(response => {
            this.poNotification.success(this.PoI18nPipe.transform(this.literals.excludedMessage, item.data + ' (' + item.descricao+ ')'));
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
    this.titleModalFeriado = this.literals.feriadosNew;
    this.modalFeriado.open();
  }
  private edit(item: IFeriados): void {
    this.isEdit = true;
    this.feriados = new Feriados();
    this.feriados = item;
    this.feriados.dataFormat = Feriados.formataData(item.data);
    this.titleModalFeriado = this.literals.feriadosEdit;
    this.modalFeriado.open();
  }

  public closeModal() {
    this.modalFeriado.close();
  }

  changeEvent(event: string) {
    this.event = event;
  }



  onChangeYear() {
    this.itemFeriadosNacionais = [];
    this.anoFeriado.forEach(ano => {
      this.servFeriadosNacionaisSubscription$ = this.servFeriados.getHoliday(ano)
        .subscribe(response => {
          this.itemFeriadosNacionais = [...this.itemFeriadosNacionais, ...response];
        });
    });
  }
  
  public saveFeriadosNacionais() {
    this.feriadosNacionais = [];
    this.itemFeriadosNacionais.forEach(element => {
      this.feriadosNacionais = [...this.feriadosNacionais, {
        "idFeriado": 0,
        "data": element.date,
        "descricao": element.name,
        "tipoFeriado": 'nacional',
        "pontoFacultativo": false,
        "dataFormat": Feriados.formataData(element.date)
      }];
    });
   
    this.servFeriadosSubscription$ = this.servFeriados
      .createFeriadosNacionais(this.feriadosNacionais)
      .subscribe(() => {
        this.poNotification.success(this.literals.createdMessage);
        this.closeModalNacionais();
        this.search();
      });

  }
  public saveFeriados() {
    this.feriados.data = this.feriados.dataFormat;
    if (this.feriados.pontoFacultativo == null) {
      this.feriados.pontoFacultativo = false;
    }
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
          this.search();
        });
    }
  }
  private formatoProperty(data: string, formato: string) {

    let day = '' + data.toString().substring(8, 10).trim();
    let month = '' + data.toString().substring(5, 7).trim();
    const year = data.toString().substring(0, 4).trim();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    if (formato === 'yyyymmdd') {
      return [year, month, day].join('-');
    } else {
      return [day, month, year].join('/');
    }

  }

  ngOnDestroy(): void {
    if (this.servFeriadosSubscription$) {
      this.servFeriadosSubscription$.unsubscribe();
    }
  }
}