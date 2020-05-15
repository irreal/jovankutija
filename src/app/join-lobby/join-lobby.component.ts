import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../lobby.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, flatMap, tap, delay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CharacterSet, Session } from '../models';
import { Character } from '../models/character.model';
import Between from 'between.js';

@Component({
  selector: 'app-join-lobby',
  templateUrl: './join-lobby.component.html',
  styleUrls: ['./join-lobby.component.scss'],
})
export class JoinLobbyComponent implements OnInit {
  lobby$: Observable<Session>;
  set: CharacterSet;
  activeCharacterIndex = 0;
  nextActiveCharacterAdjustment = 0;
  playerNickname: string;
  selectedCharacterName: string;
  selectedCharacterAvatar: string;
  nickname: string;
  errorText: string;
  showError = false;
  nextCharacterLeft = 50;
  nextCharacterOpacity = 1;
  characterLeft = 50;
  characterOpacity = 1;
  lastWidth = 0;
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

  updatePan(event) {
    const width = event.deltaX / (window.innerWidth / 100);
    this.nextActiveCharacterAdjustment = 0;
    if (width > 0) {
      this.nextActiveCharacterAdjustment = -1;
    } else if (width < 0) {
      this.nextActiveCharacterAdjustment = 1;
    }
    this.characterLeft = 50 + width;
    const nextCharOffset = Math.max(35 - Math.abs(width), 0);
    this.nextCharacterLeft =
      50 + (width < 0 ? nextCharOffset : -nextCharOffset);
    this.characterOpacity = 1 - Math.abs(width) / 25;
    this.nextCharacterOpacity = Math.abs(width) / 25;
    this.lastWidth = width;
  }
  endPan(threshold: number = 16) {
    let frame = 1;
    const frameCount = 5;

    const startLeft = this.characterLeft;
    const nextCharOffset = Math.max(35 - Math.abs(this.lastWidth), 0);
    const nextStartLeft =
      50 + (this.lastWidth < 0 ? nextCharOffset : -nextCharOffset);
    this.nextCharacterOpacity = Math.abs(this.lastWidth) / 25;

    let finalLeft: number;
    let nextFinalLeft: number;
    let charOpacityStep: number;
    let nextCharOpacityStep: number;

    if (Math.abs(this.lastWidth) > threshold) {
      finalLeft = this.lastWidth > 0 ? 75 : 25;
      nextFinalLeft = 50;
      charOpacityStep = (0 - this.characterOpacity) / frameCount;
      nextCharOpacityStep = (1 - this.nextCharacterOpacity) / frameCount;
    } else {
      nextFinalLeft = this.lastWidth < 0 ? 85 : 15;
      finalLeft = 50;
      charOpacityStep = (1 - this.characterOpacity) / frameCount;
      nextCharOpacityStep = (0 - this.nextCharacterOpacity) / frameCount;
    }

    const animationFrame = () => {
      const progress = frame / frameCount;

      this.characterLeft = startLeft + (finalLeft - startLeft) * progress;
      this.nextCharacterLeft =
        nextStartLeft + (nextFinalLeft - nextStartLeft) * progress;
      this.characterOpacity += charOpacityStep;
      this.nextCharacterOpacity += nextCharOpacityStep;

      if (frame < frameCount) {
        frame++;
        requestAnimationFrame(animationFrame);
      } else if (Math.abs(this.lastWidth) > threshold) {
        this.nextActiveCharacterAdjustment = 0;
        this.characterLeft = 50;
        this.characterOpacity = 1;
        if (this.lastWidth < 0) {
          this.updateActiveCharacterIndex(1);
          return;
        }
        this.updateActiveCharacterIndex(-1);
      }
    };

    requestAnimationFrame(animationFrame);
  }

  cycleCharacter(amount: number) {
    if (amount < 0) {
      amount = -1;
    } else {
      amount = 1;
    }
    this.nextActiveCharacterAdjustment = amount * -1;
    this.lastWidth = amount;
    this.endPan(0);
  }
  updateActiveCharacterIndex(amount: number) {
    this.activeCharacterIndex += amount;
    while (this.activeCharacterIndex < 0) {
      this.activeCharacterIndex += this.characters.length;
    }
    this.activeCharacterIndex =
      this.activeCharacterIndex % this.characters.length;
  }

  get nextActiveCharacter() {
    if (!this.set || !this.set.characters || !this.set.characters.length) {
      return {} as Character;
    }
    let index = this.activeCharacterIndex + this.nextActiveCharacterAdjustment;
    if (index < 0) {
      index += this.set.characters.length;
    }
    index = index % this.set.characters.length;

    if (index < 0 || index >= this.set.characters.length) {
      return {} as Character;
    }
    return this.set.characters[index];
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
