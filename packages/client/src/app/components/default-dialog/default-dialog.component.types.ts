import { IconName } from '@app/components/icon/icon.component.type';

export interface DefaultDialogButtonParameters {
    content: string;
    closeDialog?: boolean;
    action?: () => void;
    redirect?: string;
    style?: string;
    icon?: IconName;
}
export interface DefaultDialogParameters {
    title: string;
    content: string;
    buttons: DefaultDialogButtonParameters[];
}
