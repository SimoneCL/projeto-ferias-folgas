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

@Component({
  selector: 'app-feriados',
  templateUrl: './feriados.component.html'  
})
export class FeriadosComponent implements OnInit{
  @ViewChild(PoModalComponent, { static: true }) poModal: PoModalComponent;
  @ViewChild('formFeriados', { static: true }) formFeriados: NgForm;

  confirm: PoModalAction;
  close: PoModalAction;

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
  feriadosItems: Array<IFeriados> = new Array<IFeriados>();
  typeOptions: Array<PoSelectOption> = [];
  createItems: IFeriados = new Feriados();

  public itemsFeriados: Array<IFeriados>;

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  event: string;
  isEdit: boolean = true;

  servFeriadosSubscription$: Subscription;
        
  constructor(
    private poI18nService: PoI18nService, 
    private servFeriados: FeriadosService,
    private poDialogService: PoDialogService,
    private PoI18nPipe: PoI18nPipe,
    private poNotification: PoNotificationService
  ) {}

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

    this.tableActions = [
      { action: this.edit.bind(this), label: this.literals.edit },
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
    ];

    this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };

    this.typeOptions = [
      { label: '', value: ''},
      { label: 'Municipal', value: 'Municipal'},
      { label: 'Estadual', value: 'Estadual'},
      { label: 'Nacional', value: 'Nacional'}
    ];
    
    this.columnsFeriados = [
      { property: 'data', label: 'Data', type: 'string' },
      { property: 'tipoFeriado', label: 'Tipo Feriado', type: 'string' },
      { property: 'descricao', label: 'Descrição', type: 'string' },
      { property: 'pontoFacultativo', label: 'Facultativo', type: 'boolean' }
    ];

    this.pontoFacultativo = false;

    this.filterSettings = {
      action: this.searchByDate.bind(this),
      placeholder: this.literals.description
    };

  }

  searchByDate(quickSearchValue: string) {
    this.disclaimers = [...[{ property: 'descricao', value: quickSearchValue }]];
    this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

  private edit(item: IFeriados): void {
    this.isEdit = true;
    this.createItems = item;    
    this.poModal.open();
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
          this.hasNext = response.hasNext;
          
          this.feriadosItems = this.itemsFeriados;      
        }
      })      
  }
  
  public readonly actions: Array<PoPageAction> = [
    { label: 'Novo', action: this.newFeriados.bind(this) }    
  ];

  delete(item: IFeriados): void {
    const id = Feriados.getInternalId(item);
    this.poDialogService.confirm({
      title: this.literals.delete,
      message: this.PoI18nPipe.transform(this.literals.modalDeleteMessage, [item.data]),
      confirm: () => {
        this.servFeriadosSubscription$ = this.servFeriados
          .delete(id)
          .subscribe(response => {
            this.poNotification.success(this.literals.excludedMessage);
            this.search();
          });
      }
    });
  }

  public newFeriados() {
    this.isEdit = false;
    this.poModal.open();
  }

  public closeModal() {
    this.poModal.close();
  }

  changeEvent(event: string) {
    this.event = event;    
  }

  searchByDesc(quickSearchValue: string) {

    this.disclaimers = [...[{ property: 'tipoFeriado', value: quickSearchValue }]];
    this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

  public saveFeriados() {    
    if (this.isEdit) {
      this.servFeriadosSubscription$ = this.servFeriados
      .update(this.createItems)
      .subscribe(() => {
        this.poNotification.success(this.literals.updatedMessage);
        this.poModal.close();
        this.search();
      });
    } else {
      this.servFeriadosSubscription$ = this.servFeriados
      .create(this.createItems)
      .subscribe(() => {
        this.poNotification.success(this.literals.createdMessage);
        this.poModal.close();
        this.search();
      });
    }   
  }  

  ngOnDestroy(): void {
    if (this.servFeriadosSubscription$) {
      this.servFeriadosSubscription$.unsubscribe();
    }
  }  
}