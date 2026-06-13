import { AppSettings } from '@/layout/service/settings.service';

export interface SettingsState {
    settings: AppSettings | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

export const initialState: SettingsState = {
    settings: null,
    loading: false,
    saving: false,
    error: null
};
