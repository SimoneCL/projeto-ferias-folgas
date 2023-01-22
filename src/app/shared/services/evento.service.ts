import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams, PoMultiselectOption } from '@po-ui/ng-components';

import { TotvsResponse } from 'dts-backoffice-util';
import { Evento, IEvento } from '../model/evento.model';
import { map, Observable } from 'rxjs';


@Injectable()
export class EventoService {
    private headers = { headers: { 'X-PO-Screen-Lock': 'true' } };

    // private apiBaseUrl = '/dts/datasul-rest/resources/prg/fin/v1/evento';
    private apiBaseUrl = 'http://localhost:3000/evento';
    
    private expandables = [''];

    constructor(private http: HttpClient) { }
    query(filters: PoDisclaimer[], page = 1, pageSize = 20): Observable<TotvsResponse<IEvento>> {
        let url = `${this.apiBaseUrl}?pageSize=${pageSize}&page=${page}`;

        if (filters && filters.length > 0) {

            const urlParams = new Array<string>();

            filters.map(filter => {
                urlParams.push(`${filter.property}=${filter.value}`);
            });

            url = `${url}&${urlParams.join('&')}`;
        }
        return this.http.get<TotvsResponse<IEvento>>(url);
    }

    getById(id: string, expandables: string[]): Observable<IEvento> {
        let lstExpandables = this.getExpandables(expandables);
        if (lstExpandables !== '') { lstExpandables = `?${lstExpandables}`; }

        return this.http.get<IEvento>(`${this.apiBaseUrl}/${id}${lstExpandables}`, this.headers);
    }

    getMetadata(type = '', id = ''): Observable<any> {
        let url = `${this.apiBaseUrl}/metadata`;
        if (id) { url = `${url}/${id}`; }
        if (type) { url = `${url}/${type}`; }
        return this.http.get<TotvsResponse<IEvento>>(url, this.headers);
    }

    
    getFilteredData({ value }): Observable<Array<PoMultiselectOption>> {
        const params = { filter: value };
        return this.http
            .get(`${this.apiBaseUrl}`, { params }).
            pipe(map((response: { items: Array<PoMultiselectOption> }) => response.items));
    }

    getObjectsByValues(value: Array<string | number>): Observable<Array<PoMultiselectOption>> {
        return this.http
            .get(`${this.apiBaseUrl}?equipes=${value.toString()}`)
            .pipe(map((response: { items: Array<PoMultiselectOption> }) => response.items));
    }


    create(model: IEvento): Observable<IEvento> {
        return this.http.post<IEvento>(this.apiBaseUrl, model, this.headers);
    }

    update(model: IEvento): Observable<IEvento> {
        return this.http.put<IEvento>(`${this.apiBaseUrl}/${Evento.getInternalId(model)}`, model, this.headers);
    }

    delete(id: string): Observable<any> {
      
        return this.http.delete(`${this.apiBaseUrl}/${id}`);
    }

    getUrl(urlBase: string, filters: PoDisclaimer[], expandables: string[], page: number, pageSize: number): string {
        const urlParams = new Array<String>();

        urlParams.push(`pageSize=${pageSize}`);
        urlParams.push(`page=${page}`);

        const lstExpandables = this.getExpandables(expandables);
        if (lstExpandables !== '') { urlParams.push(lstExpandables); }

        if (filters && filters.length > 0) {
            filters.map(filter => {
                urlParams.push(`${filter.property}=${filter.value}`);
            });
        }

        return `${urlBase}?${urlParams.join('&')}`;
    }

    getExpandables(expandables: string[]): string {
        let lstExpandables = '';

        if (expandables && expandables.length > 0) {
            expandables.map(expandable => {
                if (expandable !== '' && this.expandables.includes(expandable)) {
                    if (lstExpandables !== '') { lstExpandables = `${lstExpandables},`; }
                    lstExpandables = `${lstExpandables}${expandable}`;
                }
            });
        }

        if (lstExpandables !== '') { lstExpandables = `expand=${lstExpandables}`; }

        return lstExpandables;
    }
}
