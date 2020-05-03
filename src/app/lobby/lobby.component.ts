import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { Session, ChatMessage } from '../models';
import { Observable } from 'rxjs';
import { LobbyService } from '../lobby.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit, AfterViewChecked {
  lobby$: Observable<Session>;
  composeText: string;
  sessionId: string;
  localUserId: string;
  showExitDialog = false;
  players: [
    { id: string; name: string; characterName: string; avatarUrl: string },
  ];
  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AngularFireAuth,
    private lobby: LobbyService,
  ) {}
  ngAfterViewChecked(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  ngOnInit(): void {
    this.auth.authState.subscribe((as) => {
      this.localUserId = as?.uid ?? '';
    });
    this.lobby$ = this.route.params.pipe(
      map((params) => params.sessionId),
      tap((sessionId) => (this.sessionId = sessionId)),
      switchMap((sessionId) =>
        this.lobby
          .getLobbyUpdates(sessionId)
          .pipe(tap((lobby) => (this.players = lobby.players))),
      ),
    );
  }

  sendMessage() {
    console.log('test');
    if (this.composeText && this.composeText.length > 0) {
      this.lobby.sendMessage(this.sessionId, this.composeText);
      this.composeText = '';
    }
  }

  formatMessageHeader(message: ChatMessage) {
    const date = new Date(message.time);
    return (
      date.getHours() + ':' + date.getMinutes() + ' ' + message.name + ': '
    );
  }

  getAvatarUrl(message: ChatMessage) {
    return message.avatarUrl;
  }

  isOwnMessage(message: ChatMessage) {
    return message.id === this.localUserId;
  }
  async leaveLobby() {
    await this.lobby.leaveLobby(this.sessionId);
    this.router.navigate(['']);
  }
}
