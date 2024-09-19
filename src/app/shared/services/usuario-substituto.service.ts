import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer, PoLookupFilteredItemsParams } from '@po-ui/ng-components';
import { Observable } from 'rxjs';

import { TotvsResponse } from 'dts-backoffice-util';
import { IUsuarioSubstituto, UsuarioSubstituto } from '../model/usuario-substituto.model';


@Injectable()
export class UsuarioSubstitutoService {
    private headers = { headers: { 'X-PO-Screen-Lock': 'true' } };

    private apiBaseUrl = 'http://10.171.119.19:3000/substitutos';

    private expandables = [''];

    constructor(private http: HttpClient) { }
    query(filters: PoDisclaimer[], page = 1, pageSize = 9999): Observable<TotvsResponse<IUsuarioSubstituto>> {

        let url = `${this.apiBaseUrl}?pageSize=${pageSize}&page=${page}`;
        if (filters && filters.length > 0) {

            const urlParams = new Array<string>();

            filters.map(filter => {
                urlParams.push(`${filter.property}=${filter.value}`);
            });

            url = `${url}&${urlParams.join('&')}`;
        }
        return this.http.get<TotvsResponse<IUsuarioSubstituto>>(url);
    }
    
    getById(id: number, expandables: string[]): Observable<IUsuarioSubstituto> {
       
        return this.http.get<IUsuarioSubstituto>(`${this.apiBaseUrl}/${id}`, this.headers);
    }    

    getFilteredItems(params: PoLookupFilteredItemsParams): Observable<IUsuarioSubstituto> {
        const header = { params: { page: params.page.toString(), pageSize: params.pageSize.toString() } };

        if (params.filter && params.filter.length > 0) {
            header.params['nomeUsuario'] = params.filter;
        }

        return this.http.get<IUsuarioSubstituto>(`${this.apiBaseUrl}`, header);
    }

    getObjectByValue(id: string): Observable<IUsuarioSubstituto> {        
        return this.http.get<IUsuarioSubstituto>(`${this.apiBaseUrl}/nome/${id}`);
    }

    create(model: IUsuarioSubstituto): Observable<IUsuarioSubstituto> {
        return this.http.post<IUsuarioSubstituto>(this.apiBaseUrl, model, this.headers);
    }

    update(model: IUsuarioSubstituto): Observable<IUsuarioSubstituto> {
        return this.http.put<IUsuarioSubstituto>(`${this.apiBaseUrl}/${UsuarioSubstituto.getInternalId(model)}`, model, this.headers);
    }

    delete(id: number): Observable<any> {
console.log('delete')
        return this.http.delete(`${this.apiBaseUrl}/${id}`);
    }
}
