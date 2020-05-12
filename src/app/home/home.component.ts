import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../lobby.service';
import { Observable } from 'rxjs';
import { Session } from '../models/session.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  sessions$: Observable<Session[]>;
  public code: string;
  public nickname: string;
  constructor(private lobby: LobbyService, private router: Router) {}

  ngOnInit(): void {
    this.sessions$ = this.lobby.getSessions();
  }

  private joinLobby(code: string) {
    this.router.navigate(['join', code, this.nickname]);
    this.code = '';
  }

  checkCode() {
    const cleanCode = this.code
      .replace(' ', '')
      .replace('-', '')
      .replace(',', '')
      .replace('_', '');
    if (cleanCode.length >= 6 && this.nickname && this.nickname.length) {
      this.joinLobby(cleanCode);
    }
  }
}
