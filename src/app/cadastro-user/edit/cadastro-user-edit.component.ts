import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoBreadcrumb, PoDialogService, PoDisclaimer, PoI18nPipe, PoI18nService, PoLookupColumn, PoModalAction, PoModalComponent, PoMultiselectOption, PoNotificationService, PoPageAction, PoSelectOption } from '@po-ui/ng-components';
import { TotvsResponse } from 'dts-backoffice-util';
import { Subscription, forkJoin } from 'rxjs';
import { ITipoPerfilUsuario } from 'src/app/shared/model/tipo-perfil-usuario.model';
import { TipoPerfilUsuarioService } from 'src/app/shared/services/tipo-perfil-usuario.service';
import { EquipeUsuario, IEquipeUsuario } from '../../shared/model/equipe-usuario.model';
import { IUsuario, Usuario } from '../../shared/model/usuario.model';
import { UsuarioService } from '../../shared/services/usuario.service';
import { UsuarioLogadoService } from '../../usuario-logado.service';

@Component({
  selector: 'app-cadastro-user-edit',
  templateUrl: './cadastro-user-edit.component.html',
  styleUrls: ['./cadastro-user-edit.component.css']
})
export class CadastroUserEditComponent implements OnInit {
  @ViewChild('modalEquipe', { static: false }) modalEquipe: PoModalComponent;

  private usuarioSubscription$: Subscription;
  private servEquipesSubscription$: Subscription;
  private servTipoPerfilUsuarioSubscription$: Subscription;
  private servEquipeUsuarioSubscription$: Subscription;
  public usuario: IUsuario = new Usuario();
  public equipeUsuar: IEquipeUsuario = new EquipeUsuario();


  breadcrumb: PoBreadcrumb;
  literals: any = {};

  public lookupColumns: Array<PoLookupColumn>;
  public properties: string;
  public propertiesName: string;
  public propertiesButton: boolean = true;
  public propertiesPassword: string;
  actionsDisable: boolean;

  eventPage: string;

  public perfilOptions: Array<PoSelectOption> = [];

  public newPassword: string;
  public confirmNewPassword: string;


  public itemsPerfil: Array<ITipoPerfilUsuario> = new Array<ITipoPerfilUsuario>();

  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];

  confirmPassword: PoModalAction;
  closePassowrd: PoModalAction;
  noShadow: true;
  userLogado: number;
  perfilUsuario: number = 0;
  nomeUsuarioSubstituto: string;

  public usuarioLogado = new UsuarioLogadoService();

  optionsEquipe: Array<PoMultiselectOption> = [];
  equipeSelected: Array<string> = [];

  disclaimersEquipe: Array<PoDisclaimer> = [];
  private disclaimers: Array<PoDisclaimer> = [];
  idUsuario = 0;

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private poI18nService: PoI18nService,
    private poNotification: PoNotificationService,
    private poDialogService: PoDialogService,
    private poI18nPipe: PoI18nPipe,
    public serviceUsuario: UsuarioService,
    private servTipoPerfilUsuario: TipoPerfilUsuarioService
  ) { }

  ngOnInit(): void {

    this.userLogado = this.usuarioLogado.getUsuarioLogado();
    this.perfilUsuario = this.usuarioLogado.getTipoPerfilUsuario();

    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));

      this.searchPerfil();
      this.eventPage = this.activatedRoute.snapshot.url[0].path;
      this.idUsuario = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
      this.setupComponents();


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
        this.atualizaPerfilUsuario(this.itemsPerfil);

      })
  }

  atualizaPerfilUsuario(itensPerfilUsuario: Array<ITipoPerfilUsuario>) {
    this.perfilOptions = [];
    for (let i in itensPerfilUsuario) {
      this.perfilOptions.push(
        { value: itensPerfilUsuario[i].idTipoPerfil, label: itensPerfilUsuario[i].descricaoPerfil },
      );
    }
    if (this.eventPage !== 'new') {
      this.get(this.idUsuario);
    }
  }

  setupComponents() {

    this.breadcrumb = this.getBreadcrumb();

    if (this.eventPage === 'detail') {
      this.properties = "true";
      this.propertiesName = "true";
      this.actionsDisable = false;

    }

    this.lookupColumns = [
      { property: 'nomeUsuario', label: 'Nome'},      
    ];    
    
    if (this.eventPage !== 'edit') {
      this.propertiesButton = false;
    }

    if (this.eventPage === 'edit') {
      this.propertiesPassword = "true";
      if (this.perfilUsuario === 0) { // mysql campo lógico é do tipo inteiro (0 ou 1) - 0 - não perfil gesto pessoal e 1 - perfil gestor
        this.properties = "true";
        this.propertiesName = "false";        
      }
    }

  }

  private beforeRedirect(itemBreadcrumbLabel) {
    this.return();
  }
  return() {
    this.route.navigate(['/cadastroUser']);;
  }
  save() {

    if (this.confirmNewPassword === this.newPassword) {
      this.usuario.senha = this.newPassword;
    }

  }

  create() {
    this.usuario.usuarioSubstituto = this.nomeUsuarioSubstituto;
    this.usuarioSubscription$ = this.serviceUsuario.create(this.usuario).subscribe((response: any) => {
      if (response.error !== '') {
        this.poNotification.error(response.error);
      } else if (response.mailError !== '') {
        this.return();
        this.poNotification.warning(response.mailError);
        this.poNotification.success(this.literals.createdMessage);
      } else {
        this.return();
        this.poNotification.success(this.literals.createdMessage);
      }
    });
  }
  update() {
    this.usuario.usuarioSubstituto = this.nomeUsuarioSubstituto;
    this.save();
    this.usuarioSubscription$ = this.serviceUsuario.update(this.usuario).subscribe(() => {
      if (this.perfilUsuario === 1) { // mysql campo lógico é do tipo inteiro (0 ou 1) - 0 - não perfil gesto pessoal e 1 - perfil gestor dev team
        this.return();
      }
      this.poNotification.success(this.literals.updatedMessage);
    });
  }

  public closeModal() {
    this.equipeSelected = [];
    this.modalEquipe.close();
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
      if (this.perfilUsuario === 0) { // mysql campo lógico é do tipo inteiro (0 ou 1) - 0 - não perfil gesto pessoal e 1 - perfil gestor dev team

        return {
          items: [
            { label: this.literals.editUser }
          ]
        };
      } else {
        return {
          items: [
            { label: this.literals.listUser, action: this.beforeRedirect.bind(this), link: '/cadastroUser' },
            { label: this.literals.editUser }
          ]
        };
      }
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
    if (this.perfilUsuario === 0) { // mysql campo lógico é do tipo inteiro (0 ou 1) - 0 - não perfil gesto pessoal e 1 - perfil gestor dev team
      return [
        {
          label: this.literals.save,
          action: this.update.bind(this, this.usuario),
        }
      ];
    }
    else {
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
        disabled: (this.eventPage !== 'new' && (this.newPassword === undefined || this.confirmNewPassword !== this.newPassword)),
        action: this.create.bind(this),
        icon: 'po-icon-plus'
      }, {
        label: this.literals.return,
        action: this.return.bind(this)
      }
    ];
  }

  alterarSenha() {
    this.route.navigate([`/alteraSenha/${this.idUsuario}`]);
  }

  get(id: number): void {
    this.usuarioSubscription$ = this.serviceUsuario
      .getById(id, [''])
      .subscribe((response: IUsuario) => {
        this.usuario = response[0];     
        this.nomeUsuarioSubstituto = this.usuario.usuarioSubstituto;    
        
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