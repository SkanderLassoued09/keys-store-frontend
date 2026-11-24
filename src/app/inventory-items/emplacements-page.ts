import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OptionsManager } from './options-manager';

@Component({
    selector: 'app-emplacements-page',
    standalone: true,
    imports: [OptionsManager, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="card max-w-3xl">
            <h2 class="mt-0 mb-1">Emplacements</h2>
            <p class="text-surface-500 mt-0 mb-4">Lieux de rangement proposés pour les articles, les articles uniques et les fournitures atelier. Un renommage met à jour tous les éléments concernés.</p>
            <app-options-manager type="LOCATION" hint="Ex: Vitrine, Étagère A2, Tiroir 3" />
        </div>
    `
})
export class EmplacementsPage {}
