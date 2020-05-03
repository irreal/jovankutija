import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Session, CharacterSet } from './models';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

// declare var firebase: any;
@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  constructor(
    private store: AngularFirestore,
    private func: AngularFireFunctions,
    private auth: AngularFireAuth,
  ) {}

  getSessions(): Observable<Session[]> {
    return this.store.collection<Session>('sessions').valueChanges();
  }
  getSession(lobbyId: string): Observable<Session> {
    return this.store
      .collection<Session>('sessions', (ref) =>
        ref.where('code', '==', lobbyId.toUpperCase()),
      )
      .valueChanges()
      .pipe(map((sessions) => sessions[0]));
  }

  getSet(setId: string): Observable<CharacterSet> {
    return this.store.doc<CharacterSet>(`sets/${setId}`).valueChanges();
  }

  getLobbyUpdates(sessionId: string): Observable<Session> {
    return this.store.doc<Session>(`sessions/${sessionId}`).valueChanges();
  }

  async joinLobby(
    lobbyId: string,
    nickname: string,
    avatarUrl: string,
    characterName: string,
  ): Promise<{ sessionId: string }> {
    const joinLobbyFunc = this.func.httpsCallable('joinLobbyC');
    return joinLobbyFunc({
      lobbyId,
      nickname,
      avatarUrl,
      characterName,
    }).toPromise();
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    const sendMessageFunc = this.func.httpsCallable('sendMessage');
    return sendMessageFunc({
      sessionId,
      message,
    }).toPromise();
  }

  async leaveLobby(sessionId: string) {
    const leaveLobbyFunc = this.func.httpsCallable('leaveLobby');
    return leaveLobbyFunc({ sessionId }).toPromise();
  }
}
