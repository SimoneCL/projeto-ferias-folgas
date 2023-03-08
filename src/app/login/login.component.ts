import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PoDialogService, PoDisclaimer, PoI18nService, PoPageDefault } from '@po-ui/ng-components';
import { PoPageLoginLiterals } from '@po-ui/ng-templates';
import { TotvsResponse } from 'dts-backoffice-util';
import { forkJoin, Subscription } from 'rxjs';
import { ILogin, Login } from '../shared/model/login.model';
import { LoginService } from '../shared/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @ViewChild('formLogin', { static: true }) formLogin: NgForm;

  items: Array<any> = new Array<any>();
  private itemsLogin: Array<ILogin>;
  //public login: Array<any> = new Array<any>();
  public login: ILogin = Login.empty();
  literalsI18n: PoPageLoginLiterals;
  loading: boolean = false;
  hasNext = false;
  currentPage = 1;
  pageSize = 20;
  expandables = [''];
  disclaimers: Array<PoDisclaimer> = [];
  
  servLoginSubscription$: Subscription;
  private i18nSubscription: Subscription;
  userLogin: ILogin;

  user: string = '';
  password: string = '';

  constructor(
    private poI18nService: PoI18nService,
    private poDialog: PoDialogService,
    private servLogin: LoginService,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.i18nSubscription.unsubscribe();
  }

  ngOnInit() {
    this.i18nSubscription = this.poI18nService.getLiterals().subscribe(literals => {
      this.literalsI18n = literals;

      //this.search();
    })
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
    
    if (this.login.usuario != "") {

      this.servLoginSubscription$ = this.servLogin
        .getByUser(this.login.usuario).subscribe((response: ILogin) => {
          this.userLogin = response;
          console.log(this.userLogin);
          console.log('2', this.login.senha);
          console.log('3', this.userLogin.senha, this.userLogin.usuario);
          if ( this.login.senha != undefined && this.login.senha === this.userLogin.senha ) {
            localStorage.setItem('usuarioLogado', this.userLogin.usuario);

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
}