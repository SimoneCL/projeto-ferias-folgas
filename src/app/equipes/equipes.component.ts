import { Component, OnInit, ViewChild } from '@angular/core';
import { PoDialogService, PoNotificationService, PoDisclaimer, PoI18nService, PoSelectOption, PoTableAction, PoBreadcrumb, PoDisclaimerGroup, PoPageFilter, PoI18nPipe } from '@po-ui/ng-components';
import { forkJoin, observable, Subscription } from 'rxjs';
import { TotvsResponse } from 'dts-backoffice-util';
import { Equipes, IEquipes } from '../shared/model/equipes.model';
import { EquipesService } from '../shared/services/equipes.service';
import { NgForm } from '@angular/forms';
import { PoModalAction, PoModalComponent } from '@po-ui/ng-components';
import { PoPageAction } from '@po-ui/ng-components';
import { PoTableColumn } from '@po-ui/ng-components';
import { UsuarioLogadoService } from '../usuario-logado.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-equipes',
  templateUrl: './equipes.component.html'  
})
export class EquipesComponent implements OnInit{
  @ViewChild(PoModalComponent, { static: true }) poModal: PoModalComponent;
  @ViewChild('formEquipes', { static: true }) formEquipes: NgForm;

  confirm: PoModalAction;
  close: PoModalAction;

  titleApp: String;
  email: string = undefined;
  isSubscribed: boolean = false;
  literals: any = {};
  codEquipe: number;
  descEquipe: string; 
  userLogado: number;
  
  filterSettings: PoPageFilter;
  breadcrumb: PoBreadcrumb;
  disclaimerGroup: PoDisclaimerGroup;
  columnsEquipes: Array<PoTableColumn>;  
  tableActions: Array<PoTableAction>;
  EquipesItems: Array<IEquipes> = new Array<IEquipes>();
  typeOptions: Array<PoSelectOption> = [];
  createItems: IEquipes = new Equipes();

  public itemsEquipes: Array<IEquipes>;

  public usuarioLogado = new UsuarioLogadoService();

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  event: string;
  isEdit: boolean = true;

  servEquipesSubscription$: Subscription;
        
  constructor(
    private poI18nService: PoI18nService, 
    private servEquipes: EquipesService,
    private poDialogService: PoDialogService,
    private PoI18nPipe: PoI18nPipe,
    private router: Router,
    private poNotification: PoNotificationService
  ) {}

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
        this.saveEquipes();
      },
      label: this.literals.save
    };

    this.close = {
      action: () => this.closeModal(),
      label: this.literals.cancel
    };    

    this.tableActions = [
      { action: this.edit.bind(this), label: this.literals.edit },
      { action: this.relacEquipe.bind(this), label: this.literals.relacEquipe },
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
    ];

    this.disclaimerGroup = {
      title: this.literals.filters,
      disclaimers: [],
      change: this.onChangeDisclaimer.bind(this)
    };
       
    this.columnsEquipes = [
      { property: 'codEquipe', label: 'Código',  width: '5%', type: 'number' },
      { property: 'descEquipe', label: 'Descrição', type: 'link',tooltip: this.literals.relacEquipe, action: (value, row) => this.relacEquipe(row)  },
      {
        property: 'detail', type: 'detail', detail: {
          columns: [
            { property: 'usuario', label: 'Usuário da Equipe' }
          ],
          typeHeader: 'top'
        }
      }
    ];
    
    this.filterSettings = {
      action: this.searchByDesc.bind(this),
      placeholder: this.literals.description
    };

  }

  searchByDesc(quickSearchValue: string) {
    this.disclaimers = [...[{ property: 'descEquipe', value: quickSearchValue }]];
    this.disclaimerGroup.disclaimers = [...this.disclaimers];
  }

  private edit(item: IEquipes): void {
    this.isEdit = true;
    this.codEquipe = item.codEquipe;
    this.descEquipe = item.descEquipe;
    this.poModal.open();
  }
  private relacEquipe(item: IEquipes): void {
    this.router.navigate(['/equipes', 'relacEquipe', Equipes.getInternalId(item)]);
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
    this.servEquipesSubscription$ = this.servEquipes
      .query(this.disclaimers || [], this.expandables, this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<IEquipes>) => {
        if (response && response.items) {
          this.itemsEquipes = [...response.items];
          this.hasNext = response.hasNext;
          
          this.EquipesItems = this.itemsEquipes;      
        }
      })      
  }
  
  public readonly actions: Array<PoPageAction> = [
    { label: 'Novo', action: this.newEquipes.bind(this) }    
  ];

  delete(item: IEquipes): void {
    const id = Equipes.getInternalId(item);
    this.poDialogService.confirm({
      title: this.literals.delete,
      message: this.PoI18nPipe.transform(this.literals.modalDeleteMessage, [item.descEquipe]),
      confirm: () => {
        this.servEquipesSubscription$ = this.servEquipes
          .delete(id)
          .subscribe(response => {
            this.poNotification.success(this.PoI18nPipe.transform(this.literals.excludedMessage, item.descEquipe));

            this.search();
          });
      }
    });
  }

  public newEquipes() {
    this.isEdit = false;
    this.codEquipe = 0;
    this.descEquipe = '';
    this.poModal.open();
  }

  public closeModal() {
    this.poModal.close();
  }

  changeEvent(event: string) {
    this.event = event;    
  }

  public saveEquipes() {   
    this.createItems = new Equipes();
    this.createItems.codEquipe = this.codEquipe;
    this.createItems.descEquipe = this.descEquipe;
    if (this.isEdit) {
    
      this.servEquipesSubscription$ = this.servEquipes
      .update(this.createItems)
      .subscribe(() => {
        this.poNotification.success(this.literals.updatedMessage);
        this.poModal.close();
        this.search();
      });
    } else {
      this.servEquipesSubscription$ = this.servEquipes
      .create(this.createItems)
      .subscribe(() => {
        this.poNotification.success(this.literals.createdMessage);
        this.poModal.close();
        this.search();
      });
    }   
  }  

  ngOnDestroy(): void {
    if (this.servEquipesSubscription$) {
      this.servEquipesSubscription$.unsubscribe();
    }
  }  
}