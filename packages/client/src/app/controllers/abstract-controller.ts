import { environment } from 'src/environments/environment';

export class AbstractController {
    private baseUrl: string;

    constructor(basePath?: `/${string}`) {
        this.baseUrl = basePath ? this.join(environment.serverUrl, basePath) : environment.serverUrl;
    }

    url(path: `/${string}`): string {
        return this.join(this.baseUrl, path);
    }

    private join(base: string, path: string = '/'): string {
        path = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
        path = path.startsWith('/') ? path : `/${path}`;

        return `${base.endsWith('/') ? base.substring(0, base.length - 1) : base}${path}`;
    }
}
