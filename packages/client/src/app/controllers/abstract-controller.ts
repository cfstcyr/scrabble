import { environment } from 'src/environments/environment';

export class AbstractController {
    private baseUrl: string;

    constructor(basePath?: `/${string}`) {
        this.baseUrl = basePath ? this.join(environment.serverUrl, basePath) : environment.serverUrl;
    }

    url(path: `/${string}`): string {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return this.join(this.baseUrl, path);
    }

    private join(base: string, path: string = '/'): string {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        path = path.endsWith('/') ? path.substring(-1) : path;
        path = path.startsWith('/') ? path : `/${path}`;

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return `${base.endsWith('/') ? base.substring(-1) : base}${path}`;
    }
}
