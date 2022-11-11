import { Component, OnInit } from '@angular/core';
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
    
    constructor(
        public poI18nService: PoI18nService,
    ) {
        this.displayVersions();
        poI18nService.setLanguage(
            TranslateService.getCurrentLanguage()
        );
    }

    ngOnInit() {

        localStorage.setItem('user', null);

        forkJoin(
            [this.poI18nService.getLiterals()]
        ).subscribe(literals => {
            literals.map(item => Object.assign(this.literals, item));
            this.menus = [
                {label: 'Férias e Folgas',icon:"po-icon-list",shortLabel:"Folgas", link: '/ferias-folga' },
                {label: 'Calendários',icon:"po-icon-calendar",shortLabel:"Calendários", link: '/calendario'},
                {label: 'Feriados',icon:"po-icon-calendar-settings",shortLabel:"Feriados", link: '/feriados'},
                {label: 'Equipes',icon:"po-icon-users",shortLabel:"Equipes", link: '/equipes'},
            ];            
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
