import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PoI18nService, PoMenuItem } from '@po-ui/ng-components';
import { TotvsResponse, TranslateService } from 'dts-backoffice-util';
import { forkJoin } from 'rxjs';
import { dependencies, git, name, version } from '../../package.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    menus: Array<PoMenuItem>;
    literals: any = {};
    ishidden: boolean = true;
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

        localStorage.setItem('usuarioLogado', null);

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
            this.router.events.subscribe((url: any) => {
                if (url instanceof NavigationEnd) {
                    this.ishidden = (url.url === '/login');
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
