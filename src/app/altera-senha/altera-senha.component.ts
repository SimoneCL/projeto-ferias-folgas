import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoDialogService, PoI18nPipe, PoI18nService, PoNotificationService } from '@po-ui/ng-components';
import { Subscription, forkJoin } from 'rxjs';
import { UsuarioService } from '../shared/services/usuario.service';
import { IUsuario } from '../shared/model/usuario.model';
import { UsuarioLogadoService } from '../usuario-logado.service';

@Component({
  selector: 'app-altera-senha',
  templateUrl: './altera-senha.component.html',
  styleUrls: ['./altera-senha.component.css']
})
export class AlteraSenhaComponent implements OnInit {

  private usuarioSubscription$: Subscription;

  usuarioAtual: IUsuario;
  urlBack: string;
  userLogado: number;
  eventPage: string;
  literals: any = {};
  idUser: number;

  public usuarioLogado = new UsuarioLogadoService();
  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private poI18nService: PoI18nService,
    private poNotification: PoNotificationService,
    private poDialogService: PoDialogService,
    private poI18nPipe: PoI18nPipe,
    private serviceUsuario: UsuarioService,
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

      this.eventPage = this.activatedRoute.snapshot.url[0].path;
      this.idUser = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
            
      this.setupComponents();
    });
  }

  setupComponents() {
    this.urlBack = `/cadastroUser/edit/${this.idUser}`;
  }

  submitChangePass(event) {
    this.validaSenhaAtual(event.currentPassword, event.newPassword);    
  }

  validaSenhaAtual(senha, senhaNova) {
    senha = window.btoa(senha);
    senhaNova = window.btoa(senhaNova);
    
    this.usuarioSubscription$ = this.serviceUsuario
    .getComparePass(this.idUser,senha, []).subscribe((response: IUsuario) => {
      if (response.idUsuario != undefined) {            
        this.usuarioAtual = response;
        
        this.usuarioSubscription$ = this.serviceUsuario
        .updatePass(this.usuarioAtual.idUsuario, senhaNova).subscribe((res: any) => {
          if (res.items.idUsuario != undefined) {   
            this.router.navigate([this.urlBack]);
          }
        });
      } else {
        this.poDialogService.alert({
          title: 'Senha incorreta!',
          message: 'Senha informada não é a mesma do usuário.'
        });
      }
    });
  }
  

}
