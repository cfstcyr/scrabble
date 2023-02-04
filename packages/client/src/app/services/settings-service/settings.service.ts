/* eslint-disable no-dupe-class-members */
import { Injectable } from '@angular/core';
import { SettingsModule } from '@app/modules/settings.module';
import store from 'store2';

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    private readonly namespace = 'scrabble-settings';

    get<K extends keyof SettingsModule>(key: K): SettingsModule[K] {
        const value = this.tryGet(key);

        if (!value) throw new Error(`No setting for key "${key as string}"`);

        return value;
    }

    tryGet<K extends keyof SettingsModule>(key: K): SettingsModule[K] | undefined {
        return store.namespace(this.namespace).get(key) ?? undefined;
    }

    set<K extends keyof SettingsModule>(key: K, value: SettingsModule[K]): void {
        store.namespace(this.namespace).set(key, value);
    }

    has<K extends keyof SettingsModule>(key: K): boolean {
        return store.namespace(this.namespace).has(key);
    }

    remove<K extends keyof SettingsModule>(key: K): void {
        store.namespace(this.namespace).remove(key);
    }

    reset(): void {
        store.namespace(this.namespace).clear();
    }
}
