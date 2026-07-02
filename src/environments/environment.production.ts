// PRODUCTION environment.
// apiUrl is intentionally EMPTY: api.config.ts then targets the SAME host the
// app is served from (backend on port 3000). This makes it work on any LAN IP
// (e.g. http://192.168.1.50 → API at http://192.168.1.50:3000) with no
// hard-coded address. Set an explicit URL here only if the API lives elsewhere.
export const environment = {
    production: true,
    apiUrl: ''
};
