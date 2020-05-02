export interface Session {
  name: string;
  code: string;
  set: string;
  setName: string;
  players: [{ name: string; characterName: string; avatarUrl: string }];
}
