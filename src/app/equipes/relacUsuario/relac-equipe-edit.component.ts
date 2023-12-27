import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoI18nPipe, PoI18nService, PoInputComponent, PoMultiselectOption, PoNotificationService, PoPageAction, PoTableColumn, PoTableColumnLabel, PoTableComponent } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { Subscription, forkJoin } from 'rxjs';
import { EquipeUsuario, IEquipeUsuario } from '../../shared/model/equipe-usuario.model';
import { Equipes, IEquipes } from '../../shared/model/equipes.model';
import { ITipoPerfilUsuario } from '../../shared/model/tipo-perfil-usuario.model';
import { IUsuario, Usuario } from '../../shared/model/usuario.model';
import { EquipeUsuarioService } from '../../shared/services/equipe-usuario.service';
import { EquipesService } from '../../shared/services/equipes.service';
import { TipoPerfilUsuarioService } from '../../shared/services/tipo-perfil-usuario.service';
import { UsuarioService } from '../../shared/services/usuario.service';

@Component({
  selector: 'app-relac-equipe-edit',
  templateUrl: './relac-equipe-edit.component.html',
  styleUrls: ['./relac-equipe-edit.component.css']
})
export class RelacEquipeEditComponent implements OnInit {
  @ViewChild('POItemsOri', { static: true }) poItemsOri: PoTableComponent;
  @ViewChild('POItemsSelected', { static: true }) poItemsSelected: PoTableComponent;
  @ViewChild('inputUsuario', { static: true }) inputUsuario: PoInputComponent;
  @ViewChild('inputUsuarioSelectUsuarioSelect', { static: true }) inputUsuarioSelectUsuarioSelect: PoInputComponent;

  private usuarioSubscription$: Subscription;
  private servEquipesSubscription$: Subscription;
  private servTipoPerfilUsuarioSubscription$: Subscription;
  private servEquipeUsuarioSubscription$: Subscription;
  public equipe: IEquipes = new Equipes();
  public equipeUsuar: IEquipeUsuario = new EquipeUsuario();
  public equipeTitle = '';

  public quickSearchUsuario = '';
  public quickSearchUsuarioSelect = '';

  private idEquipe = '';

  breadcrumb: PoBreadcrumb;
  literals: any = {};

  eventPage: string;

  public itemsPerfil: Array<ITipoPerfilUsuario> = new Array<ITipoPerfilUsuario>();

  hasNext = false;
  currentPage = 1;
  pageSize = 999999;
  expandables = [''];
  isLoading = true;
  columns: Array<PoTableColumn> = [];

  userLogado: string;
  public itemsEquipeUsuario: Array<IEquipeUsuario> = new Array<IEquipeUsuario>();
  public items: Array<IUsuario> = new Array<IUsuario>();
  public itemsSelected: Array<IUsuario> = new Array<IUsuario>();
  public itemsDeleted: IUsuario = new Usuario();
  usuarioTipo: Array<PoTableColumnLabel> = [];

  disclaimersUsuario: Array<PoDisclaimer> = [];
  disclaimersUsuarSelect: Array<PoDisclaimer> = [];
  private disclaimers: Array<PoDisclaimer> = [];

  loading: boolean = false;

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private poI18nService: PoI18nService,
    private poNotification: PoNotificationService,
    private poDialogService: PoDialogService,
    private poI18nPipe: PoI18nPipe,
    private servEquipes: EquipesService,
    private serviceEquipeUsuario: EquipeUsuarioService,
    public serviceUsuario: UsuarioService,
    private servTipoPerfilUsuario: TipoPerfilUsuarioService
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


      this.eventPage = this.activatedRoute.snapshot.url[0].path;
      this.idEquipe = this.activatedRoute.snapshot.paramMap.get('id');
      this.searchPerfil();
      this.get(this.idEquipe);
      this.searchUsuario();
      const interval = setInterval(() => { // aguarda ate que carregue
        if (this.itemsPerfil && this.equipe) {
          clearInterval(interval);
          this.setupComponents();
        }
      }, 60);



    });
  }


  searchEquipeUsuario(): void {
    this.itemsEquipeUsuario = [];
    this.disclaimers = [{ property: 'codEquipe', value: this.idEquipe }]
    this.isLoading = true;
    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario
      .queryByEquipe(this.disclaimers, this.currentPage, 99999)
      .subscribe((response: TotvsResponse<IEquipeUsuario>) => {
        this.itemsEquipeUsuario = response.items;
        this.searchUsuarioselect(this.itemsEquipeUsuario);

      });
  }

  searchPerfil(): void {
    this.currentPage = 1;

    this.servTipoPerfilUsuarioSubscription$ = this.servTipoPerfilUsuario
      .query(this.disclaimers || [], [], this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<ITipoPerfilUsuario>) => {
        if (response && response.items) {
          this.itemsPerfil = [...response.items];
          this.hasNext = response.hasNext;
        }
      })
  }
  searchUsuario(loadMore = false): void {

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.items = [];
      this.currentPage = 1;
    }

    if (this.quickSearchUsuario === '') {
      this.disclaimersUsuario = [];
    } else {
      this.disclaimersUsuario = [{ property: 'nomeUsuario', value: this.quickSearchUsuario }]
    }

    this.isLoading = true;
    this.usuarioSubscription$ = this.serviceUsuario
      .query(this.disclaimersUsuario, this.currentPage, 99999)
      .subscribe((response: TotvsResponse<IUsuario>) => {
        this.items = response.items;
        this.selectRow();

        this.hasNext = response.hasNext;
        this.isLoading = false;
      });
  }
  searchUsuarioselect(equipeUsuario: Array<IEquipeUsuario>): void {
    this.disclaimersUsuarSelect = [];
    this.itemsSelected = [];

    if (this.quickSearchUsuarioSelect !== '') {
      this.disclaimersUsuarSelect = [{ property: 'nomeUsuario', value: this.quickSearchUsuarioSelect }]
    }
    for (let i in equipeUsuario) {

      this.disclaimersUsuarSelect.push({ property: 'idUsuario', value: equipeUsuario[i].idUsuario },
        { property: 'codEquipe', value: equipeUsuario[i].codEquipe });
    }

    this.isLoading = true;

    if (equipeUsuario.length > 0 && this.disclaimersUsuarSelect.length) {
      this.usuarioSubscription$ = this.serviceUsuario
        .query(this.disclaimersUsuarSelect, 1, 99999)
        .subscribe((response: TotvsResponse<IUsuario>) => {
          this.itemsSelected = response.items;

          this.selectRow();


          this.hasNext = response.hasNext;
          this.isLoading = false;
        });
    }

  }

  selectRow() {
    for (let i in this.itemsSelected) {
      this.poItemsOri.getUnselectedRows().findIndex((row, indexR) => {
        if (row.idUsuario === this.itemsSelected[i].idUsuario) {
          this.poItemsOri.selectRowItem(row);
          this.poItemsOri.updateItem(row, this.itemsSelected[i]);
         

        }
      });
    }
  }

  public onKeyQuickSearchUsuar(key: number) {

    if (key === 13) { // enter
      this.searchUsuario();
      this.searchUsuarioselect(this.itemsEquipeUsuario);

    }
  }
  public onChangeQuickSearchUsuar(event: string) {
    this.searchUsuario();
    this.searchUsuarioselect(this.itemsEquipeUsuario);
    this.inputUsuario.focus();
  }

  public onKeyQuickSearchUsuarioSelect(key: number) {
    if (key === 13) { // enter
      this.searchEquipeUsuario();
    }
  }

  public onChangeQuickSearchUsuarioSelect(event: string) {
    this.searchEquipeUsuario();
    this.inputUsuarioSelectUsuarioSelect.focus();
  }

  private disableSelectablePoItemsOri() {
    if (this.quickSearchUsuarioSelect !== '') {
      this.poItemsOri.selectable = false;
    } else {
      this.poItemsOri.selectable = true;
    }
  }

  changeOptions(event, type): void {
    this.equipeUsuar = {
      idUsuario: event.idUsuario,
      codEquipe: this.idEquipe
    };
    this.change(event, type);
   
   if(type === 'new'){
    this.create(event.nomeUsuario);
   } else {
    this.delete();
   }
   
  }

  change(event, type){
    switch (type) {
      case 'new': {
        this.itemsSelected.push({
          idUsuario: event.idUsuario,
          nomeUsuario: event.nomeUsuario,
          email: event.email,
          tipoPerfil: event.tipoPerfil,
          senha: event.senha,
          usuarioSubstituto: event.usuarioSubstituto
        });
        this.itemsSelected = [...this.itemsSelected];
    
       return this.itemsSelected;
      }
      case 'delete': {
        const index = this.itemsSelected.findIndex(el => {
          this.itemsDeleted = {...this.itemsDeleted,...event};
          el.idUsuario === event.idUsuario
        });
        this.poItemsSelected.removeItem(index);
        this.itemsSelected = [...this.poItemsSelected.items];
        
        return this.itemsSelected;
      }
    }

  }

  deleteItems(items: Array<any>) {
    this.items = items;
    this.itemsSelected = [];
  }


  setupComponents() {
    this.breadcrumb = this.getBreadcrumb();

    for (let i in this.itemsPerfil) {
      this.usuarioTipo.push(
        { value: this.itemsPerfil[i].idTipoPerfil, label: this.itemsPerfil[i].descricaoPerfil },
      );
    }

    this.columns = [

      { property: 'nomeUsuario', label: this.literals.usuario, type: 'string' },
      { property: 'email', label: this.literals.email, type: 'string' },
      { property: 'tipoPerfil', label: this.literals.perfil, type: 'label', labels: this.usuarioTipo },
    ];
  }


  private beforeRedirect() {
    this.return();
  }
  return() {
    this.route.navigate(['/equipes']);;
  }

  create(nomeUsuario: string) {
    
    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario.create(this.equipeUsuar).subscribe(() => {
     
      this.searchEquipeUsuario();
      this.poNotification.success(this.poI18nPipe.transform(this.literals.createdEquipeMessage, nomeUsuario));
    });
  }
  delete() {

    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario.delete(this.equipeUsuar).subscribe(() => {
      this.searchEquipeUsuario();
      this.poNotification.success(this.poI18nPipe.transform(this.literals.excludedEquipMessage, this.itemsDeleted.nomeUsuario));

    });
  }


  getTitle(): string {
    return this.poI18nPipe.transform(this.literals.relacEquipeUsuario, [this.equipeTitle]);

  }
  getBreadcrumb() {
    return {
      items: [
        { label: this.literals.equipe, action: this.beforeRedirect.bind(this), link: '/equipes' },
        { label: this.poI18nPipe.transform(this.literals.relacEquipeUsuario, [this.equipeTitle]) }
      ]
    };

  }

  getActions(): Array<PoPageAction> {
    return [
      {
        label: this.literals.return,
        action: this.return.bind(this)
      }
    ];
  }

  get(id: string): void {
    this.usuarioSubscription$ = this.servEquipes
      .getById(id)
      .subscribe((response: IEquipes) => {
        this.equipe = response;

        this.equipeTitle = this.equipe.descEquipe.toLowerCase();

        this.searchEquipeUsuario();
      });
  }

  ngOnDestroy(): void {
    if (this.usuarioSubscription$) {
      this.usuarioSubscription$.unsubscribe();
    }
    if (this.servEquipesSubscription$) {
      this.servEquipesSubscription$.unsubscribe();
    }
    if (this.servEquipeUsuarioSubscription$) {
      this.servEquipeUsuarioSubscription$.unsubscribe();
    }
    if (this.servTipoPerfilUsuarioSubscription$) {
      this.servTipoPerfilUsuarioSubscription$.unsubscribe();
    }
  }
}