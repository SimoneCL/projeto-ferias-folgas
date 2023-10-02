import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoI18nPipe, PoI18nService, PoModalAction, PoModalComponent, PoMultiselectOption, PoNotificationService, PoPageAction, PoSelectOption, PoTableAction, PoTableColumn, PoTableColumnLabel, PoTableComponent } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { Subscription, forkJoin } from 'rxjs';
import { ITipoPerfilUsuario } from 'src/app/shared/model/tipo-perfil-usuario.model';
import { TipoPerfilUsuarioService } from 'src/app/shared/services/tipo-perfil-usuario.service';
import { EquipeUsuario, IEquipeUsuario } from '../../shared/model/equipe-usuario.model';
import { IUsuario, Usuario } from '../../shared/model/usuario.model';
import { UsuarioService } from '../../shared/services/usuario.service';
import { EquipesService } from 'src/app/shared/services/equipes.service';
import { Equipes, IEquipes } from 'src/app/shared/model/equipes.model';
import { EquipeUsuarioService } from 'src/app/shared/services/equipe-usuario.service';

@Component({
  selector: 'app-relac-equipe-edit',
  templateUrl: './relac-equipe-edit.component.html',
  styleUrls: ['./relac-equipe-edit.component.css']
})
export class RelacEquipeEditComponent implements OnInit {
  @ViewChild('POItemsOri', { static: true }) poItemsOri: PoTableComponent;
  @ViewChild('POItemsSelected', { static: true }) poItemsSelected: PoTableComponent;

  private usuarioSubscription$: Subscription;
  private servEquipesSubscription$: Subscription;
  private servTipoPerfilUsuarioSubscription$: Subscription;
  private servEquipeUsuarioSubscription$: Subscription;
  public equipe: IEquipes = new Equipes();
  public equipeUsuar: IEquipeUsuario = new EquipeUsuario();
  public equipeTitle = '';


  private idEquipe = '';

  breadcrumb: PoBreadcrumb;
  literals: any = {};

  eventPage: string;

  public itemsPerfil: Array<ITipoPerfilUsuario> = new Array<ITipoPerfilUsuario>();

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  isLoading = true;
  columns: Array<PoTableColumn> = [];

  userLogado: string;
  public itemsEquipeUsuario: Array<IEquipeUsuario> = new Array<IEquipeUsuario>();
  public items: Array<IUsuario> = new Array<IUsuario>();
  public itemsSelected: Array<IUsuario> = new Array<IUsuario>();
  public usuarioRelac: Array<IUsuario> = new Array<IUsuario>();
  usuarioTipo: Array<PoTableColumnLabel> = [];


  optionsEquipe: Array<PoMultiselectOption> = [];
  equipeSelected: Array<string> = [];

  disclaimersEquipe: Array<PoDisclaimer> = [];
  disclaimersUsuario: Array<PoDisclaimer> = [];
  private disclaimers: Array<PoDisclaimer> = [];



  /**lookup */
  loading: boolean = false;
  multiLookup: Array<any> = [];

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
      this.get(this.idEquipe);
      this.searchUsuario();
      this.setupComponents();


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
        //this.searchPerfil();

      });


  }

  searchUsuario(loadMore = false): void {

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.items = [];
      this.currentPage = 1;
    }

    this.isLoading = true;
    this.usuarioSubscription$ = this.serviceUsuario
      .query([], this.currentPage, 99999)
      .subscribe((response: TotvsResponse<IUsuario>) => {
        this.items = response.items;
        //this.searchPerfil();


        this.hasNext = response.hasNext;
        this.isLoading = false;
      });
  }
  searchUsuarioselect(equipeUsuario: Array<IEquipeUsuario>): void {
    this.disclaimersUsuario = [];
    this.itemsSelected = [];
    this.usuarioRelac = [];
    for (let i in equipeUsuario) {
      this.disclaimersUsuario.push({ property: 'idUsuario', value: equipeUsuario[i].idUsuario });
    }
    this.itemsSelected = [];

    this.isLoading = true;

    if (this.disclaimersUsuario.length) {
      this.usuarioSubscription$ = this.serviceUsuario
        .query(this.disclaimersUsuario, 1, 99999)
        .subscribe((response: TotvsResponse<IUsuario>) => {
          this.itemsSelected = response.items;

          this.selectRow();

          //this.searchPerfil();

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

        } else {

        }
      });
    }

  }


  changeOptions(event, type): void {
    this.equipeUsuar = {
      idUsuario: event.idUsuario,
      codEquipe: this.idEquipe
    };

    if (type === 'new') {
      this.itemsSelected.push({
        idUsuario: event.idUsuario,
        nomeUsuario: event.nomeUsuario,
        email: event.email,
        tipoPerfil: event.tipoPerfil,
        senha: event.senha
      });
      this.itemsSelected = [...this.itemsSelected];
      this.create();
    } else {
      
        const index = this.itemsSelected.findIndex(el => el.idUsuario === event.idUsuario);
        this.poItemsSelected.removeItem(index);
        this.itemsSelected = [...this.poItemsSelected.items];
        this.delete();

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
      { property: 'idUsuario', label: 'idUsuario', type: 'number', visible: false },
      { property: 'nomeUsuario', label: this.literals.usuario, type: 'string' },
      { property: 'email', label: this.literals.email, type: 'string' },
    ];
  }


  private beforeRedirect() {
    this.return();
  }
  return() {
    this.route.navigate(['/equipes']);;
  }

  create() {
    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario.create(this.equipeUsuar).subscribe(() => {
      this.poNotification.success(this.literals.createdMessage);
    });
  }
  delete() {

    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario.delete(this.equipeUsuar).subscribe(() => {
      this.poNotification.success(this.literals.excludedMessage);
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
  }
}