import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoCheckboxGroupOption, PoDialogService, PoDisclaimer, PoI18nPipe, PoI18nService, PoModalAction, PoModalComponent, PoMultiselectOption, PoNotificationService, PoPageAction, PoRadioGroupOption, PoSelectOption, PoTableAction, PoTableColumn } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { EquipeUsuario, IEquipeUsuario } from '../../shared/model/equipe-usuario.model';
import { Equipes, IEquipes } from '../../shared/model/equipes.model';
import { IUsuario, Usuario } from '../../shared/model/usuario.model';
import { EquipeUsuarioService } from '../../shared/services/equipe-usuario.service';
import { EquipesService } from '../../shared/services/equipes.service';
import { UsuarioService } from '../../shared/services/usuario.service';

@Component({
  selector: 'app-cadastro-user-edit',
  templateUrl: './cadastro-user-edit.component.html',
  styleUrls: ['./cadastro-user-edit.component.css']
})
export class CadastroUserEditComponent implements OnInit {
  @ViewChild('modalEquipe', { static: false }) modalEquipe: PoModalComponent;
  @ViewChild('modalSenha', { static: false }) modalSenha: PoModalComponent;

  private usuarioSubscription$: Subscription;
  private servEquipesSubscription$: Subscription;
  private servEquipeUsuarioSubscription$: Subscription;
  public usuario: IUsuario = new Usuario();
  public equipeUsuar: IEquipeUsuario = new EquipeUsuario();


  breadcrumb: PoBreadcrumb;
  literals: any = {};

  public properties: string;
  public propertiesButton: string;
  public propertiesPassword: string;
  actionsDisable: boolean;

  eventPage: string;

  public perfilOptions: Array<PoRadioGroupOption>;
  public newPassword: string;
  public confirmNewPassword: string;

  tableActions: Array<PoTableAction>;
  equipesList: Array<IEquipes> = new Array<IEquipes>();
  equipeUsuario: Array<IEquipeUsuario> = new Array<IEquipeUsuario>();

  equipeItems: Array<IEquipes> = new Array<IEquipes>();
  equipes: Array<IEquipes> = new Array<IEquipes>();
  columns: Array<PoTableColumn>;

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  //disclaimers: Array<PoDisclaimer> = [];

  confirm: PoModalAction;
  close: PoModalAction;
  confirmPassword: PoModalAction;
  closePassowrd: PoModalAction;
  noShadow: true;
  userLogado: string;

  optionsEquipe: Array<PoMultiselectOption> = [];
  equipeSelected: Array<string> = [];

  disclaimersEquipe: Array<PoDisclaimer> = [];

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private poI18nService: PoI18nService,
    private poNotification: PoNotificationService,
    private poDialogService: PoDialogService,
    private poI18nPipe: PoI18nPipe,
    private serviceUsuario: UsuarioService,
    private serviceEquipeUsuario: EquipeUsuarioService,
    private servEquipes: EquipesService,
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
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      console.log('id', id)
      if (id) {
        this.get(id);

      }
      this.setupComponents();
    });
  }

  setupComponents() {
    this.searchEquipes();
    this.breadcrumb = this.getBreadcrumb();
    this.perfilOptions = [
      { label: 'Team Lead', value: '1' },
      { label: 'Product Owner', value: '2' },
      { label: 'Dev Team', value: '3' }
    ];

    if (this.eventPage === 'detail') {
      this.properties = "true";
      this.actionsDisable = false;
      this.propertiesPassword = "true";
    }

    if (this.eventPage !== 'edit') {
      this.propertiesButton = "false";
    }

    if (this.eventPage === 'edit') {
      this.propertiesPassword = "true";
    }


    this.columns = [
      { property: 'codEquipe', label: 'Código', type: 'number', width: '10%' },
      { property: 'descEquipe', label: 'Descrição', type: 'string' }
    ];

    this.tableActions = [
      { action: this.delete.bind(this), visible: this.actionsDisable, label: this.literals.delete, type: 'danger' }
    ];

    this.confirm = {
      action: () => {
        this.relacEquipe();
      },
      label: this.literals.save
    };

    this.close = {
      action: () => this.closeModal(),
      label: this.literals.cancel
    };
    this.confirmPassword = {
      action: () => this.confirmePassWordModal(),
      label: this.literals.save
    };

    this.closePassowrd = {
      action: () => this.closePassWordModal(),
      label: this.literals.cancel
    };
  }

  private beforeRedirect(itemBreadcrumbLabel) {
    this.return();
  }
  return() {
    this.route.navigate(['/cadastroUser']);;
  }
  save() {
    if (this.eventPage !== 'edit') {
      this.usuario.idUsuario = Math.floor(Math.random() * 65536);
    }
    if (this.confirmNewPassword === this.newPassword) {
      this.usuario.senha = this.newPassword;
    }

  }
  create() {
    this.save();
    this.usuarioSubscription$ = this.serviceUsuario.create(this.usuario).subscribe(() => {
      this.return();
      this.poNotification.success(this.literals.createdMessage);
    });
  }
  update() {
    this.save();
    this.usuarioSubscription$ = this.serviceUsuario.update(this.usuario).subscribe(() => {
      this.return();
      this.poNotification.success(this.literals.updatedMessage);
    });
  }


  public closeModal() {
    this.equipeSelected = [];
    this.modalEquipe.close();
  }

  public confirmePassWordModal() {

    this.modalSenha.close();
  }
  public closePassWordModal() {
    this.modalSenha.close();
  }

  public relacEquipe() {
    console.log('equipeSelected', this.equipeSelected)
     for (let i in this.equipeSelected) {
     
      this.equipeUsuar.codEquipe = this.equipeSelected[i];
      this.equipeUsuar.idUsuario = this.usuario.idUsuario;
      this.saveEquipeUsuario();
    }
    this.searchEquipeUsuario();

    this.closeModal();

  }
 

  delete(item: IEquipeUsuario) {
    this.poDialogService.confirm({
      title: this.literals.remove,
      message: this.poI18nPipe.transform(this.literals.modalDeleteMessage, [item.codEquipe]),
      confirm: () => {
        this.remove(item);

      }
    });
  }

  public remove(item: IEquipeUsuario) {
    const idEquipeUsuario = `${this.usuario.idUsuario};${item.codEquipe}`;


    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario
      .delete(idEquipeUsuario)
      .subscribe(response => {
        this.searchEquipeUsuario();
        this.poNotification.success(this.literals.excludedMessage);

      });

  }

  saveEquipeUsuario() {
    console.log('this.equipeUsuar', this.equipeUsuar)
    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario.create(this.equipeUsuar).subscribe(() => {
    });
  }
  getTitle(): string {
    if (this.eventPage === 'edit') {
      return this.literals.editUser;
    } else if (this.eventPage === 'detail') {
      return this.literals.detailUser;
    } else {
      return this.literals.newUser;
    }
  }
  getBreadcrumb() {
    if (this.eventPage === 'edit') {
      return {
        items: [
          { label: this.literals.listUser, action: this.beforeRedirect.bind(this), link: '/cadastroUser' },
          { label: this.literals.editUser }
        ]
      };
    } else if (this.eventPage === 'detail') {
      return {
        items: [
          { label: this.literals.listUser, action: this.beforeRedirect.bind(this), link: '/cadastroUser' },
          { label: this.literals.detailUser }
        ]
      };
    } else {
      return {
        items: [
          { label: this.literals.listUser, action: this.beforeRedirect.bind(this), link: '/cadastroUser' },
          { label: this.literals.newUser }
        ]
      };
    }
  }

  getActions(): Array<PoPageAction> {
    switch (this.eventPage) {
      case 'edit': {
        return this.editActions();
      }
      case 'detail': {
        return this.detailActions();
      }
    }
    return this.newActions();
  }

  editActions(): Array<PoPageAction> {

    return [
      {
        label: this.literals.save,
        action: this.update.bind(this, this.usuario),
      },
      {
        label: this.literals.return,
        action: this.return.bind(this)
      }
    ];

  }

  detailActions(): Array<PoPageAction> {
    return [
      {
        label: this.literals.return,
        action: this.return.bind(this),
      }
    ];
  }

  newActions(): Array<PoPageAction> {
    return [
      {
        label: this.literals.save,
        disabled: (this.newPassword === undefined || this.confirmNewPassword !== this.newPassword),
        action: this.create.bind(this),
        icon: 'po-icon-plus'
      }, {
        label: this.literals.return,
        action: this.return.bind(this)
      }
    ];
  }


  abrirSenha() {
    this.modalSenha.open();
  }

  abrirEquipe() {
    console.log('abriEquipe', this.optionsEquipe)
    this.searchEquipes();
    this.modalEquipe.open();

  }

  searchEquipes(loadMore = false): void {
    this.optionsEquipe = [];
    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;
    }

    console.log('searchEquipes')
    this.hasNext = false;
    this.servEquipesSubscription$ = this.servEquipes
      .query([], [], 1, 999)
      .subscribe((response: TotvsResponse<IEquipes>) => {
        if (response && response.items) {
          this.equipesList = [...response.items];
          this.hasNext = response.hasNext;
          console.log('equipesList',this.equipesList)
          for (let i  in this.equipesList) {
            this.optionsEquipe.push({ label: this.equipesList[i].descEquipe, value: this.equipesList[i].codEquipe });
            console.log('this.optionsEquipe', this.optionsEquipe)
          }
        }
      });
      console.log(' this.optionsEquipe',  this.optionsEquipe)
  }

  
  get(id: string): void {
    console.log('get id', id)
    this.usuarioSubscription$ = this.serviceUsuario
      .getById(id, [''])
      .subscribe((response: IUsuario) => {
       
        this.usuario = response;
        console.log('this.usuario ', this.usuario )
        this.searchEquipeUsuario();

      });
  }

  getEquipe(): void {

    this.disclaimersEquipe = [];
    for (let i  in this.equipeUsuario) {
     
      this.disclaimersEquipe.push({ property: 'codEquipe', value: this.equipeUsuario[i].codEquipe });
      console.log('getEquipe', this.disclaimersEquipe);
    }
    
    this.hasNext = false;
    this.servEquipesSubscription$ = this.servEquipes
      .query(this.disclaimersEquipe, this.expandables, 1, 9999)
      .subscribe((response: TotvsResponse<IEquipes>) => {
        if (response && response.items) {
          console.log('response.items', response.items)
          this.equipeItems = [...this.equipeItems, ...response.items];
          this.hasNext = response.hasNext;
        }
      });
  }
  searchEquipeUsuario() {
    this.equipeUsuario = [];
    this.equipeItems = [];
   

    this.hasNext = false;
    this.servEquipeUsuarioSubscription$ = this.serviceEquipeUsuario
      .query([{ property: 'idUsuario', value: this.usuario.idUsuario }])
      .subscribe((response: TotvsResponse<IEquipeUsuario>) => {
        if (response && response.items) {
          this.equipeUsuario = [...response.items];
          console.log('this.equipeUsuario', this.equipeUsuario)
          this.hasNext = response.hasNext;
        }
        if (this.equipeUsuario.length > 0) {
          this.getEquipe();
        }
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