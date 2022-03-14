import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from '@app/classes/communication/message';
import { LetterValue } from '@app/classes/tile';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import { LOCAL_PLAYER_ID, MAX_INPUT_LENGTH, OPPONENT_ID, SYSTEM_ERROR_ID, SYSTEM_ID } from '@app/constants/game';
import { GameService, InputParserService } from '@app/services';
import { FocusableComponent } from '@app/services/focusable-components/focusable-component';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import { MessageStorageService } from '@app/services/message-storage/message-storage.service';
import { marked } from 'marked';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type LetterMapItem = { letter: LetterValue; amount: number };

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss', './communication-box-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('messageInput') messageInputElement: ElementRef;
    @ViewChild('textBoxContainer') textBoxContainer: ElementRef;
    @ViewChild('virtualScroll', { static: false }) scrollViewport: CdkVirtualScrollViewport;
    componentDestroyed$: Subject<boolean> = new Subject();

    messages: Message[] = [];
    messageForm = new FormGroup({
        content: new FormControl('', [Validators.maxLength(MAX_INPUT_LENGTH), Validators.minLength(1)]),
    });

    lettersLeftTotal: number = 0;
    lettersLeft: LetterMapItem[] = [];

    loading: boolean = false;

    constructor(
        private inputParser: InputParserService,
        private gameService: GameService,
        private focusableComponentsService: FocusableComponentsService,
        private changeDetectorRef: ChangeDetectorRef,
        private messageStorageService: MessageStorageService,
    ) {
        super();
        this.focusableComponentsService.setActiveKeyboardComponent(this);
        this.messageStorageService.initializeMessages();
    }

    ngOnInit(): void {
        this.lettersLeft = this.gameService.tileReserve;
        this.lettersLeftTotal = this.gameService.tileReserveTotal;

        this.gameService.updateTileReserveEvent.pipe(takeUntil(this.componentDestroyed$)).subscribe(({ tileReserve, tileReserveTotal }) => {
            this.onTileReserveUpdate(tileReserve, tileReserveTotal);
        });
        this.gameService.newMessageValue.pipe(takeUntil(this.componentDestroyed$)).subscribe((newMessage: Message | null) => {
            if (newMessage) this.onReceiveNewMessage(newMessage);
        });

        const sessionStorageMessages = this.messageStorageService.getMessages();
        if (sessionStorageMessages.length > 0) this.messages = this.messages.concat(sessionStorageMessages);
        else this.onReceiveNewMessage(INITIAL_MESSAGE);
    }

    ngAfterViewInit(): void {
        this.subscribeToFocusableEvents();
    }

    ngOnDestroy(): void {
        this.unsubscribeToFocusableEvents();
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
        this.messageStorageService.resetMessages();
    }

    createVisualMessage(newMessage: Message): Message {
        switch (newMessage.senderId) {
            case this.gameService.getLocalPlayerId():
                newMessage.senderId = LOCAL_PLAYER_ID;
                break;
            case SYSTEM_ID:
            case SYSTEM_ERROR_ID:
                break;
            default:
                newMessage.senderId = OPPONENT_ID;
                break;
        }

        return { ...newMessage, content: marked.parseInline(newMessage.content) };
    }

    onSendMessage(): void {
        const message = this.messageForm.get('content')?.value;
        if (message && message.length > 0 && !this.loading) {
            this.inputParser.parseInput(message);
            this.messageForm.reset({ content: '' });
            this.loading = true;
        }
    }

    onReceiveNewMessage(newMessage: Message): void {
        this.messages = [...this.messages, this.createVisualMessage(newMessage)];
        this.changeDetectorRef.detectChanges();
        this.scrollToBottom();
        if (newMessage.senderId !== OPPONENT_ID) this.loading = false;
        this.messageStorageService.saveMessage(newMessage);
    }

    onTileReserveUpdate(tileReserve: LetterMapItem[], tileReserveTotal: number): void {
        this.lettersLeft = tileReserve;
        this.lettersLeftTotal = tileReserveTotal;
    }

    onContainerClick(): void {
        this.focusableComponentsService.setActiveKeyboardComponent(this);
    }

    protected onFocusableEvent(event: KeyboardEvent): void {
        if (!this.isCtrlC(event)) this.messageInputElement?.nativeElement?.focus();
    }

    private isCtrlC(event: KeyboardEvent): boolean {
        return event.key === 'c' && (event.ctrlKey || event.metaKey);
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            this.scrollViewport.scrollTo({
                bottom: 0,
                behavior: 'auto',
            });
        }, 0);
    }
}
