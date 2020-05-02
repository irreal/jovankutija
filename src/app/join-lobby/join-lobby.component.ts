import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../lobby.service';
import { ActivatedRoute } from '@angular/router';
import { map, flatMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CharacterSet, Session } from '../models';

@Component({
  selector: 'app-join-lobby',
  templateUrl: './join-lobby.component.html',
  styleUrls: ['./join-lobby.component.scss'],
})
export class JoinLobbyComponent implements OnInit {
  lobby$: Observable<Session>;
  set$: Observable<CharacterSet>;
  playerNickname: string;
  selectedCharacter: string;
  constructor(private lobby: LobbyService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.lobby$ = this.route.params.pipe(
      tap(() => (this.set$ = of({} as CharacterSet))),
      map((params) => params.lobbyId as string),
      flatMap((lobbyId) => this.lobby.getSession(lobbyId)),
      tap((lobby) => {
        this.set$ = this.lobby.getSet(lobby.set).pipe(
          tap((set) => {
            console.log('set', set);
          }),
        );
      }),
    );
  }
  parametersValid(): boolean {
    return !!(
      this.playerNickname &&
      this.playerNickname.length > 2 &&
      this.selectedCharacter
    );
  }
  joinLobby() {
    // this.lobby.joinLobby(
    //   this.route.snapshot.params.lobbyId,
    //   this.playerNickname,
    //   this.selectedCharacter,
    // );
    alert('Žao mi je, odavde na dalje ne radi ništa. Dođite sutra :D');
  }
}
