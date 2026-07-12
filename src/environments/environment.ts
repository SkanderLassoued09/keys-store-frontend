// DEVELOPMENT environment (default).
// Angular swaps this for environment.production.ts under the `production`
// build configuration (see angular.json fileReplacements).
export const environment = {
    production: false,
    // Backend on the local machine. Use 127.0.0.1 (IPv4) explicitly rather than
    // "localhost" — on some systems "localhost" resolves to IPv6 ::1 first, but
    // the dev backend binds IPv4 127.0.0.1, which would cause "Failed to fetch".
    apiUrl: 'http://127.0.0.1:3000'
};
