import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { JoinLobbyComponent } from './join-lobby/join-lobby.component';
import { LobbyComponent } from './lobby/lobby.component';
import { HomeMobileComponent } from './home-mobile/home-mobile.component';

const routes: Routes = [
  { path: '', component: HomeMobileComponent },
  { path: 'join/:lobbyId', component: JoinLobbyComponent },
  { path: 'lobby/:sessionId', component: LobbyComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
