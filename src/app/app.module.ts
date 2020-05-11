import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';

import { HomeComponent } from './home/home.component';
import { JoinLobbyComponent } from './join-lobby/join-lobby.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ORIGIN } from '@angular/fire/functions';
import { LobbyComponent } from './lobby/lobby.component';
import { GameComponent } from './game/game.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    JoinLobbyComponent,
    LobbyComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    TabViewModule,
    ButtonModule,
    DialogModule,
    InputMaskModule,
  ],
  // providers: [{ provide: ORIGIN, useValue: 'http://localhost:5001' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
