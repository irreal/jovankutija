import {
  Component,
  OnInit,
  ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR,
} from '@angular/core';
import { LobbyService } from '../lobby.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, flatMap, tap, share, single, shareReplay } from 'rxjs/operators';
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
  selectedCharacterName: string;
  selectedCharacterAvatar: string;
  errorText: string;
  showError = false;
  constructor(
    private lobby: LobbyService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.lobby$ = this.route.params.pipe(
      tap(() => (this.set$ = of({} as CharacterSet))),
      map((params) => params.lobbyId as string),
      flatMap((lobbyId) => this.lobby.getSession(lobbyId)),
      tap((lobby) => (this.set$ = this.lobby.getSet(lobby.set))),
    );
  }
  parametersValid(): boolean {
    return !!(
      this.playerNickname &&
      this.playerNickname.length > 2 &&
      this.selectedCharacterName &&
      this.selectedCharacterAvatar
    );
  }
  async joinLobby() {
    try {
      const response = await this.lobby.joinLobby(
        this.route.snapshot.params.lobbyId,
        this.playerNickname,
        this.selectedCharacterAvatar,
        this.selectedCharacterName,
      );
      this.router.navigate(['lobby', response.sessionId]);
    } catch (err) {
      this.showError = true;
      this.errorText = err.toString();
      console.error(err);
    }
  }

  notSelectedCharacters(set: CharacterSet, lobby: Session) {
    return set.characters.filter(
      (ch) => !lobby.players.find((p) => p.avatarUrl === ch.avatarUrl),
    );
  }

  setSelected(character: any) {
    this.selectedCharacterAvatar = character.avatarUrl;
    this.selectedCharacterName = character.name;
  }
}
