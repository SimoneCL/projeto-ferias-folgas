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
        forkJoin(
            [this.poI18nService.getLiterals()]
        ).subscribe(literals => {
            literals.map(item => Object.assign(this.literals, item));
            console.log('entrou no component')
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
