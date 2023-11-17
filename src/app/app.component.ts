import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationSkipped, Router } from '@angular/router';
import { PoI18nService, PoMenuComponent, PoMenuItem, PoToolbarComponent, PoToolbarProfile } from '@po-ui/ng-components';
import { TotvsResponse, TranslateService } from 'dts-backoffice-util';
import { Subscription, forkJoin } from 'rxjs';
import { dependencies, git, name, version } from '../../package.json';
import { UsuarioLogadoService } from './usuario-logado.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    @ViewChild('toolbarProfile', { static: true }) toolbarProfile: PoToolbarComponent;
    @ViewChild('userMenu') userMenu: PoMenuComponent;

    menus: Array<PoMenuItem>;
    literals: any = {};
    ishidden: boolean = true;

    public usuarioLogado = new UsuarioLogadoService();

    public profile: PoToolbarProfile;
    
    constructor(
        public poI18nService: PoI18nService,
        private router: Router
    ) {
        this.displayVersions();
        poI18nService.setLanguage(
            TranslateService.getCurrentLanguage()
        );
    }

    ngOnInit() {

        this.usuarioLogado.clearUsuarioLogado();
                
        forkJoin(
            [this.poI18nService.getLiterals()]
        ).subscribe(literals => {
            
            literals.map(item => Object.assign(this.literals, item));
            this.menus = [
                { label: 'Cadastro', icon: "po-icon-user-add", shortLabel: "Cadastro", link: '/cadastroUser' },
                { label: 'Férias e Folgas', icon: "po-icon-calendar-ok", shortLabel: "Folgas", link: '/feriasFolga' },
                { label: 'Agenda', icon: "po-icon-calendar", shortLabel: "Agenda", link: '/agendaUser' },
                { label: 'Tipo evento', icon: "po-icon-document", shortLabel: "Evento", link: '/tipoEvento' },
                { label: 'Feriados', icon: "po-icon-calendar-settings", shortLabel: "Feriados", link: '/feriados' },
                { label: 'Equipes', icon: "po-icon-users", shortLabel: "Equipes", link: '/equipes' },
                { label: 'Perfil', icon: "po-icon-waiter", shortLabel: "Perfil", link: '/perfilUsuario' },
                { label: 'Sair', icon: "po-icon-close", shortLabel: "Sair", link: '/login' },
            ];

            this.profile = {
                avatar: 'https://via.placeholder.com/48x48?text=Login',
                title: 'Login',
                subtitle: ''
            };

            this.usuarioLogado.setProfile(this.toolbarProfile);                                          
            
            this.router.events.subscribe((url: any) => {
                if (url instanceof NavigationEnd) {                
                    this.ishidden = (url.url === '/login');    
                    this.usuarioLogado.setMenu(this.userMenu);
                }
            });
        });
    }
    
    displayVersions(): void {
        /*console.log('App:', name);
        console.log('Git Info:', git);
        console.log('Versão do App:', version);
        console.log('Dependencias:');
        Object.keys(dependencies).forEach((key) => console.log(' - ', key, ':', dependencies[key]));*/
    }
}
