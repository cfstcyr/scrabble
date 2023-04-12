/* eslint-disable no-console */
import { UserId } from '@app/classes/user/connected-user-types';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/controllers-constants';

import * as admin from 'firebase-admin';
import { AndroidConfig } from 'firebase-admin/lib/messaging/messaging-api';
import { join } from 'path';
import { Service } from 'typedi';
export const FIREBASE_KEY_PATH = '../../../assets/log3900-polyscrabble-firebase-adminsdk-key.json';
export const NOTIFICATION_TITLE = 'Revenez!';
export const NOTIFICATION_DESCRIPTION = 'Venez vous amuser sur PolyScrabble. On vous attend avec impatience!';
export const REMINDER_DELAY_IN_MINUTES = 5;

@Service()
export class NotificationService {
    private mobileUserTokens: Map<UserId, string>;
    private scheduledNotifications: Map<UserId, NodeJS.Timeout>;

    constructor() {
        this.mobileUserTokens = new Map();
        this.scheduledNotifications = new Map();
        const filePath = join(__dirname, FIREBASE_KEY_PATH);
        admin.initializeApp({
            credential: admin.credential.cert(filePath),
        });
    }

    addMobileUserToken(userId: UserId, firebaseToken: string) {
        this.mobileUserTokens.set(userId, firebaseToken);
    }

    scheduleReminderNotification(userId: UserId) {
        const firebaseToken = this.mobileUserTokens.get(userId);
        if (!firebaseToken) return;
        const scheduledNotification = setTimeout(() => {
            this.sendReminderNotification(userId, firebaseToken, NOTIFICATION_TITLE, NOTIFICATION_DESCRIPTION);
        }, 10 * SECONDS_TO_MILLISECONDS);

        this.scheduledNotifications.set(userId, scheduledNotification);
        return scheduledNotification;
    }

    async sendReminderNotification(userId: UserId, registrationToken: string, title: string, body: string) {
        if (!this.scheduledNotifications.delete(userId)) return;
        const message = {
            notification: {
                title,
                body,
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                },
            } as AndroidConfig,
            token: registrationToken,
        };

        try {
            const response = await admin.messaging().send(message);
            console.log(`Successfully sent notification: ${response}`);
        } catch (error) {
            console.error(`Error sending notification: ${error}`);
        }
    }

    removeScheduledNotification(userId: UserId) {
        const scheduledNotification = this.scheduledNotifications.get(userId);
        if (scheduledNotification) clearTimeout(scheduledNotification);
        this.scheduledNotifications.delete(userId);
    }
}
