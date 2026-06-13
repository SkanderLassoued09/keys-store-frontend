import { AppSettings } from '@/layout/service/settings.service';
import { createAction, props } from '@ngrx/store';

export const loadSettings = createAction('[Settings] Load Settings');
export const loadSettingsSuccess = createAction('[Settings] Load Settings Success', props<{ settings: AppSettings }>());
export const loadSettingsFailure = createAction('[Settings] Load Settings Failure', props<{ error: string }>());

export const updateSettings = createAction('[Settings] Update Settings', props<{ settings: Partial<AppSettings> }>());
export const updateSettingsSuccess = createAction('[Settings] Update Settings Success', props<{ settings: AppSettings }>());
export const updateSettingsFailure = createAction('[Settings] Update Settings Failure', props<{ error: string }>());
