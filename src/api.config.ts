import { environment } from './environments/environment';

// Resolve the API base URL per environment:
//  - development: the explicit apiUrl (http://localhost:3000)
//  - production:  apiUrl is empty, so we target the SAME host that served the
//    app, on port 3000. A phone at http://192.168.1.50 then calls the API at
//    http://192.168.1.50:3000 — no hard-coded IP, works on any LAN address.
function resolveBaseUrl(): string {
    if (environment.apiUrl) return environment.apiUrl;
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3000`;
}

export const API_CONFIG = {
    baseUrl: resolveBaseUrl()
};
