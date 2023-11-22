import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PoDialogService, PoDisclaimer, PoI18nService, PoToolbarComponent, PoToolbarProfile, PoModalComponent, PoModalAction, PoNotificationService } from '@po-ui/ng-components';
import { PoPageLoginLiterals } from '@po-ui/ng-templates';
import { TotvsResponse } from 'dts-backoffice-util';
import { Subscription, forkJoin } from 'rxjs';
import { ILogin, Login } from '../shared/model/login.model';
import { IUsuario, Usuario } from '../shared/model/usuario.model';
import { LoginService } from '../shared/services/login.service';
import { PoModalPasswordRecoveryComponent, PoModalPasswordRecoveryType } from '@po-ui/ng-templates';
import { UsuarioService } from '../shared/services/usuario.service';
import { UsuarioLogadoService } from '../usuario-logado.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @ViewChild('formLogin', { static: true }) formLogin: NgForm;
  @ViewChild('modalRecSenha', { static: false }) modalRecSenha: PoModalComponent;
  
  confirmRecSenha: PoModalAction;
  closeRecSenha: PoModalAction;
  eventPage: string;
  items: Array<any> = new Array<any>();
  private itemsLogin: Array<ILogin>;
  private usuario: IUsuario = new Usuario();
  
  //public login: Array<any> = new Array<any>();
  public login: ILogin = Login.empty();
  literalsI18n: PoPageLoginLiterals;
  loading: boolean = false;
  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  literals: any = {};
  profileTitle: any;
  menu: any;
  menusPerfil: Array<any>;

  servLoginSubscription$: Subscription;
  usuarioSubscription$: Subscription;

  private i18nSubscription: Subscription;
  userLogin: ILogin;

  user: string = '';
  password: string = '';

  public usuarioLogado = new UsuarioLogadoService();

  constructor(
    private poI18nService: PoI18nService,
    private poDialog: PoDialogService,
    private servLogin: LoginService,
    private router: Router,
    private usuarioService: UsuarioService,
    private poNotification: PoNotificationService
  ) { }

  ngOnInit() {
    forkJoin(
      [
        this.poI18nService.getLiterals(),
        this.poI18nService.getLiterals({ context: 'general' })
      ]
    ).subscribe(literals => {
      literals.map(item => Object.assign(this.literals, item));
                  
      this.usuarioLogado.clearUsuarioLogado();      
      this.setupComponents();
    });    
  }

  buscarEmail(email: string): void {
    this.usuarioSubscription$ = this.usuarioService
      .getByEmail(email)
      .subscribe((response: IUsuario) => {
        this.usuario = response;
        this.update();

        this.closeModal();

      });
  }
  
  update() {
    this.usuarioSubscription$ = this.usuarioService.update(this.usuario).subscribe(() => {
      this.poNotification.success(this.literals.sendMail); 
    });
  }

  setupComponents() {
    console.log(this.literals?.enviar);
    this.confirmRecSenha = {
      action: () => {
        
        this.buscarEmail(this.login.email);

        const mailOptions = {
          from: 'sender@email.com', // sender address
          to: 'to@email.com', // receiver (use array of string for a list)
          subject: 'Subject of your email', // Subject line
          html: '<p>Your html here</p>'// plain text body
        };
      },
      label: this.literals?.enviar      
    };

    this.closeRecSenha = {
      action: () => this.closeModal(),
      label: this.literals?.cancel
    };
  }

  search(loadMore = false): void {
    if (loadMore === true) {
      this.currentPage = this.currentPage + 1;
    } else {
      this.currentPage = 1;
      this.items = [];
    }

    this.hasNext = false;
    this.servLoginSubscription$ = this.servLogin
      .query(this.disclaimers, [], this.currentPage, this.pageSize)
      .subscribe((response: TotvsResponse<ILogin>) => {

        if (response && response.items) {
          this.itemsLogin = [...this.items, ...response.items];
          this.hasNext = response.hasNext;
        }

        if (this.itemsLogin.length === 0) {
          this.currentPage = 1;
        }

      });
  }  

  onClick() {
    
    if (this.login.nomeUsuario != "") {    
      
      let senhaHash = window.btoa(this.login.senha);
      
      this.servLoginSubscription$ = this.servLogin
        .getByUser(this.login.nomeUsuario, senhaHash).subscribe((response: ILogin) => {
          
          if (response.email != undefined) {            
            this.userLogin = response;
            this.usuarioLogado.setUsuarioLogado(this.userLogin.idUsuario, this.userLogin.nomeUsuario);

            if (this.userLogin.idUsuario != undefined) {
              
              if (this.userLogin.tipoPerfil < 2) {
                this.menusPerfil = [
                  { label: 'Férias e Folgas', icon: "po-icon-calendar-ok", shortLabel: "Folgas", link: '/feriasFolga' },
                  { label: 'Agenda', icon: "po-icon-calendar", shortLabel: "Agenda", link: '/agendaUser' },
                  { label: 'Sair', icon: "po-icon-close", shortLabel: "Sair", link: '/login' },
                ];
              } else {
                this.menusPerfil = [
                  { label: 'Cadastro', icon: "po-icon-user-add", shortLabel: "Cadastro", link: '/cadastroUser' },
                  { label: 'Férias e Folgas', icon: "po-icon-calendar-ok", shortLabel: "Folgas", link: '/feriasFolga' },
                  { label: 'Agenda', icon: "po-icon-calendar", shortLabel: "Agenda", link: '/agendaUser' },
                  { label: 'Tipo evento', icon: "po-icon-document", shortLabel: "Evento", link: '/tipoEvento' },
                  { label: 'Feriados', icon: "po-icon-calendar-settings", shortLabel: "Feriados", link: '/feriados' },
                  { label: 'Equipes', icon: "po-icon-users", shortLabel: "Equipes", link: '/equipes' },
                  { label: 'Perfil', icon: "po-icon-waiter", shortLabel: "Perfil", link: '/perfilUsuario' },
                  { label: 'Sair', icon: "po-icon-close", shortLabel: "Sair", link: '/login' },
                ];
              }

              this.profileTitle = this.usuarioLogado.getProfile();
              this.profileTitle.profile = {
                avatar: 'https://via.placeholder.com/54x54?text=' + this.userLogin.nomeUsuario.substring(0,1).toUpperCase(),
                title: this.userLogin.nomeUsuario,
                subtitle: this.userLogin.email
              };
              
              this.menu = this.usuarioLogado.getMenu();          
              while(this.menu.menus.length) {
                this.menu.menus.pop();
              }
              this.menusPerfil.forEach(item => {
                this.menu.menus.push(item);
              });
            }
            
            setTimeout(() => {
              this.router.navigate(['/feriasFolga']);
            }, 500);            
          } else {
            this.poDialog.alert({
              ok: () => (this.loading = false),
              title: 'Login Invalido',
              message: 'usuario ou senha incorretos.'
            });
          }
        });
    }
  }

  abrirRecSenha() {
    this.modalRecSenha.open();
  }

  closeModal() {
    this.modalRecSenha.close();
  }



}