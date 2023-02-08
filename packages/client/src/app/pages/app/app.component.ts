import { Component, OnDestroy } from '@angular/core';
import { InitializeState } from '@app/classes/connection-state-service/connection-state';
import { InitializerService } from '@app/services/initializer-service/initializer.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
    // states: typeof InitializeState = InitializeState;
    // state: InitializeState = InitializeState.Loading;
    states: typeof InitializeState = InitializeState;
    state: Observable<InitializeState>;
    message: Observable<string | undefined>;
    private componentDestroyed$: Subject<boolean> = new Subject();

    constructor(private readonly initializer: InitializerService) {
        // this.initializer.subscribe(this.componentDestroyed$, this.handleNewState.bind(this));
        this.state = this.initializer.state.pipe(map(({ state }) => state));
        this.message = this.initializer.state.pipe(map(({ message }) => message));
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    // handleNewState(state: InitializeState): void {
    //     this.state = state;
    // }
}
