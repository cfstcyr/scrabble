import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserService } from '@app/services/user-service/user.service';
import { SharedUser } from '@common/models/user';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-search-page',
    templateUrl: './search-page.component.html',
    styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent {
    searchField: FormControl;
    results: Observable<SharedUser[]>;

    constructor(private readonly userService: UserService) {
        this.searchField = new FormControl();
        this.results = this.userService.searchUsers(this.searchField.valueChanges.pipe(map((value) => `${value}`)));
    }
}
