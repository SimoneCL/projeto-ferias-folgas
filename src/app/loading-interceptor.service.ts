import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpEvent, HttpHeaders } from '@angular/common/http';

@Injectable()
export class LoadingInterceptorService implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let req: HttpRequest<any>;
        const headers = new HttpHeaders({
            'X-PO-Screen-Lock': 'true'
        });

        if (!request.headers.get('X-PO-Screen-Lock')) {
            req = request.clone({
                headers,
                setHeaders: {
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache",
                }
            });


        } else {
            req = request.clone({
                setHeaders: {
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache",
                }
            });
        }
        
        return next.handle(req);
    }

}
