import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { JoinLobbyComponent } from './join-lobby/join-lobby.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'join/:lobbyId', component: JoinLobbyComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
