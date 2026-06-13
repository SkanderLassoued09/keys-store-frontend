import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';

import * as SettingsActions from '../store/settings-store/settings.actions';
import * as SettingsSelectors from '../store/settings-store/settings.selectors';

@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputNumberModule,
        ToastModule
    ],
    templateUrl: './admin-settings.html',
    styleUrl: './admin-settings.scss'
})
export class AdminSettings implements OnInit {
    private readonly store = inject(Store);
    private readonly destroyRef = inject(DestroyRef);

    readonly settingsForm = new FormGroup({
        serviceCommissionPercent: new FormControl<number | null>(
            0,
            [Validators.required, Validators.min(0)]
        )
    });

    readonly loading$ = this.store.select(
        SettingsSelectors.selectSettingsLoading
    );

    readonly saving$ = this.store.select(
        SettingsSelectors.selectSettingsSaving
    );

    ngOnInit(): void {
        this.store.dispatch(SettingsActions.loadSettings());

        this.store
            .select(SettingsSelectors.selectSettings)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((settings) => {
                if (!settings) {
                    return;
                }

                this.settingsForm.patchValue(
                    {
                        serviceCommissionPercent: Number(
                            settings.serviceCommissionPercent ?? 0
                        )
                    },
                    { emitEvent: false }
                );
            });
    }

    saveSettings(): void {
        this.settingsForm.markAllAsTouched();

        if (this.settingsForm.invalid) {
            return;
        }

        this.store.dispatch(
            SettingsActions.updateSettings({
                settings: {
                    serviceCommissionPercent: Number(
                        this.settingsForm.controls.serviceCommissionPercent.value ?? 0
                    )
                }
            })
        );
    }
}