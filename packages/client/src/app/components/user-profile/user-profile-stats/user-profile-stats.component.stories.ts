import { IconComponent } from '@app/components/icon/icon.component';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { UserProfileStatsItemComponent } from '@app/components/user-profile/user-profile-stats-item/user-profile-stats-item.component';
import { UserProfileStatsComponent } from './user-profile-stats.component';
import { MatCardModule } from '@angular/material/card';

export default {
    title: 'User/Profile/Stats',
    component: UserProfileStatsComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent, UserProfileStatsItemComponent],
            imports: [MatCardModule],
        }),
    ],
} as Meta;

export const primary: Story<UserProfileStatsComponent> = (props: UserProfileStatsComponent) => ({
    props,
    template: `
        <app-user-profile-stats>
            <app-user-profile-stats-item title="Stat 1" value="62">
                <app-icon stats-icon icon="flag" styling="solid"></app-icon>
            </app-user-profile-stats-item>

            <app-user-profile-stats-item title="Stat 2" value="142">
                <app-icon stats-icon icon="drone" styling="solid"></app-icon>
            </app-user-profile-stats-item>

            <app-user-profile-stats-item title="Stat 3" value="14">
                <app-icon stats-icon icon="user" styling="solid"></app-icon>
            </app-user-profile-stats-item>
        </app-user-profile-stats>
    `,
});
