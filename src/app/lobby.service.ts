import { Injectable, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Session, CharacterSet } from './models';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// declare var firebase: any;
@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  constructor(private store: AngularFirestore) {}

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
    return this.store
      .doc<CharacterSet>(`sets/${setId}`)
      .valueChanges()
      .pipe(
        tap((set) => {
          console.log('wa ta fak', set);
        }),
      );
  }
  // testFunction() {
  //   fetch('https://us-central1-jovankutija.cloudfunctions.net/helloWorld')
  //     .then((r) => r.json())
  //     .then((r) => {
  //       console.log('evo ga', r);
  //     })
  //     .catch((err) => console.error('shit', err));
  // }

  async joinLobby(lobbyId: string, nickname: string, character: string) {
    const response = await fetch(
      'https://us-central1-jovankutija.cloudfunctions.net/joinLobby',
      {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ lobbyId, nickname, character }),
      },
    );
    return response.json();
  }
}
