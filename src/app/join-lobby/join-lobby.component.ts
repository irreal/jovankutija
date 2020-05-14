import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../lobby.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, flatMap, tap, delay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CharacterSet, Session } from '../models';
import { Character } from '../models/character.model';

@Component({
  selector: 'app-join-lobby',
  templateUrl: './join-lobby.component.html',
  styleUrls: ['./join-lobby.component.scss'],
})
export class JoinLobbyComponent implements OnInit {
  lobby$: Observable<Session>;
  set: CharacterSet;
  activeCharacterIndex = 0;
  playerNickname: string;
  selectedCharacterName: string;
  selectedCharacterAvatar: string;
  nickname: string;
  errorText: string;
  showError = false;
  constructor(
    private lobby: LobbyService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.lobby$ = this.route.params.pipe(
      tap((params) => {
        this.set = {} as CharacterSet;
        this.nickname = params.nickname as string;
      }),
      map((params) => params.lobbyId as string),
      flatMap((lobbyId) => this.lobby.getSession(lobbyId)),
      tap((lobby) =>
        this.lobby.getSet(lobby.set).subscribe((set) => {
          this.set = set;
        }),
      ),
    );
  }

  get activeCharacter() {
    if (!this.set || !this.set.characters || !this.set.characters.length) {
      return {} as Character;
    }
    if (
      this.activeCharacterIndex < 0 ||
      this.activeCharacterIndex >= this.set.characters.length
    ) {
      return {} as Character;
    }
    return this.set.characters[this.activeCharacterIndex];
  }
  get characters(): Character[] {
    if (!this.set || !this.set.characters) {
      return [];
    }
    return this.set.characters;
  }

  isInUse(character: Character, lobby: Session) {
    const player = this.getPlayerFromCharacterName(lobby, character.name);
    return !!player;
  }
  private getPlayerFromCharacterName(lobby: Session, characterName: string) {
    return lobby.players.find((p) => p.characterName === characterName);
  }

  getCharacterPlayerName(name: string, lobby: Session) {
    const player = this.getPlayerFromCharacterName(lobby, name);
    if (!player) {
      return undefined;
    }
    return player.name;
  }

  getCharacterTitle(character: Character, lobby: Session) {
    const name = this.getCharacterPlayerName(character.name, lobby);
    if (name) {
      return `${name} kao ${character.name}`;
    }
    return `${character.name}`;
  }
  selectCharacter(character: Character, lobby: Session) {
    if (this.isInUse(character, lobby)) {
      this.errorText = `Lik "${this.activeCharacter.name}" je već zauzet. Odaberite jedan od dostupnih likova`;
      this.showError = true;
      return;
    }
    this.joinLobby(character, lobby);
  }
  async joinLobby(character: Character, lobby: Session) {
    try {
      const response = await this.lobby.joinLobby(
        this.route.snapshot.params.lobbyId,
        this.nickname,
        character.avatarUrl,
        character.name,
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
