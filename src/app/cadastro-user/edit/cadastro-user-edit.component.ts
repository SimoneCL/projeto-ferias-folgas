import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoI18nPipe, PoI18nService, PoModalAction, PoModalComponent, PoMultiselectOption, PoNotificationService, PoPageAction, PoRadioGroupOption, PoTableAction, PoTableColumn } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { Equipes, IEquipes } from '../../shared/model/equipes.model';
import { IUsuario, Usuario } from '../../shared/model/usuario.model';
import { EquipesService } from '../../shared/services/equipes.service';
import { UsuarioService } from '../../shared/services/usuario.service';

@Component({
  selector: 'app-cadastro-user-edit',
  templateUrl: './cadastro-user-edit.component.html',
  styleUrls: ['./cadastro-user-edit.component.css']
})
export class CadastroUserEditComponent implements OnInit {
  @ViewChild(PoModalComponent, { static: true }) modalEquipe: PoModalComponent;

  private usuarioSubscription$: Subscription;
  private servEquipesSubscription$: Subscription;
  public usuario: IUsuario = new Usuario();

  breadcrumb: PoBreadcrumb;
  literals: any = {};

  eventPage: string;

  public perfilOptions: Array<PoRadioGroupOption>;
  public newPassword: string;
  public confirmNewPassword: string;

  tableActions: Array<PoTableAction>;
  equipesList: Array<IEquipes> = new Array<IEquipes>();

  equipeItems: Array<IEquipes> = new Array<IEquipes>();
  equipes: Array<IEquipes> = new Array<IEquipes>();
  columns: Array<PoTableColumn>;

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];

  confirm: PoModalAction;
  close: PoModalAction;

  optionsEquipe: Array<PoMultiselectOption> = [];
  equipeSelected: Array<string> = [];
  private equipesSalvar: Array<IEquipes> = [];
  private equipesDeletar: Array<IEquipes> = [];
  // equipe: IEquipes = new Equipes();


  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private poI18nService: PoI18nService,
    private poNotification: PoNotificationService,
    private poDialogService: PoDialogService,
    private poI18nPipe: PoI18nPipe,
    private serviceUsuario: UsuarioService,
    private servEquipes: EquipesService,
  ) { }

  ngOnInit(): void {
    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));

      this.eventPage = this.activatedRoute.snapshot.url[0].path;
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      this.equipesSalvar = [];
      this.equipesDeletar = [];
      if (id) {
        this.get(id);
        
      }
      this.setupComponents();


    });
  }

  setupComponents() {

    this.breadcrumb = this.getBreadcrumb();
    this.perfilOptions = [
      { label: 'Team Lead', value: '1' },
      { label: 'Product Owner', value: '2' },
      { label: 'Dev Team', value: '3' }
    ];

    this.columns = [
      { property: 'codEquipe', label: 'Código', type: 'number', width: '10%' },
      { property: 'descEquipe', label: 'Descrição', type: 'string' }
    ];

    this.tableActions = [
      { action: this.delete.bind(this), label: this.literals.delete, type: 'danger' }
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
  }
  private beforeRedirect(itemBreadcrumbLabel) {
    this.return();
  }
  return() {
    this.route.navigate(['/cadastroUser']);;
  }
  save() {
    if (this.eventPage !== 'edit') {
      this.usuario.IdUsuario = Math.floor(Math.random() * 65536);
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
      this.poNotification.success(this.literals.createdMessage);
    });
  }


  public closeModal() {
    this.equipeSelected = [];
    this.modalEquipe.close();
  }


  public relacEquipe() {
    for (let i in this.equipeSelected) {
      this.getEquipe(this.equipeSelected[i])

    }
    this.closeModal();

  }
  getEquipe(id: string): void {
    
    this.servEquipesSubscription$ = this.servEquipes
      .getById(id)
      .subscribe((response: IEquipes) => {


        this.equipeItems = [... this.equipeItems, response];
        if (this.equipeItems.length !== 0) {
          const parsed_array = this.equipeItems.map(val => { return JSON.stringify(val) })
          this.equipeItems = parsed_array.filter((value, ind) => parsed_array.indexOf(value) == ind).map((val) => { return JSON.parse(val) });

          this.equipesSalvar = [...this.equipeItems];

          this.usuario.equipes = Object.keys(this.equipeItems.reduce((acc, curr) => (acc[curr.codEquipe] = '', acc), {}));
        }
      });

  }

  delete(item: IEquipes) {
    this.poDialogService.confirm({
      title: this.literals.remove,
      message: this.poI18nPipe.transform(this.literals.modalDeleteMessage, [item.codEquipe]),
      confirm: () => {
        this.remove(item);

      }
    });
  }

  public remove(item: IEquipes) {
    if (this.equipesSalvar) {
      this.equipesSalvar.forEach((equipe, index) => {
        if (equipe.codEquipe === item.codEquipe) {
          this.equipesSalvar.splice(index, 1);
        }
      });
    }

    if (this.equipeItems) {
      this.equipeItems.forEach((equipe, index) => {
        if (equipe.codEquipe === item.codEquipe) {
          this.equipesDeletar.push(equipe);
          this.equipeItems.splice(index, 1);
          this.usuario.equipes = Object.keys(this.equipeItems.reduce((acc, curr) => (acc[curr.codEquipe] = '', acc), {}));
        
        }
      });
    }
  }

  getTitle(): string {
    if (this.eventPage === 'edit') {
      return this.literals.editUser;
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
        disabled: (this.newPassword === undefined || this.confirmNewPassword !== this.newPassword),
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
        action: this.return.bind(this)
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

  get(id: string): void {
    this.usuario.equipes = [];
    this.usuarioSubscription$ = this.serviceUsuario
      .getById(id, [''])
      .subscribe((response: IUsuario) => {
        this.usuario = response;
        for (let i in this.usuario.equipes) {
          this.getEquipe(this.usuario.equipes[i]);
        }
      });
  }

  onClick() {
    this.optionsEquipe = [];
    this.searchEquipes();
    this.modalEquipe.open();

  }

  searchEquipes(loadMore = false): void {

    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;
    }

    this.hasNext = false;
    this.servEquipesSubscription$ = this.servEquipes
      .query(this.disclaimers, [], 1, 999)
      .subscribe((response: TotvsResponse<IEquipes>) => {
        if (response && response.items) {
          this.equipesList = [...response.items];
          this.hasNext = response.hasNext;
          for (let i in this.equipesList) {
            this.optionsEquipe.push({ label: this.equipesList[i].descEquipe, value: this.equipesList[i].codEquipe });
          }
        }
      })
  }
  ngOnDestroy(): void {
    if (this.usuarioSubscription$) {
      this.usuarioSubscription$.unsubscribe();
    }
    if (this.servEquipesSubscription$) {
      this.servEquipesSubscription$.unsubscribe();
    }
  }
}