import { ChatMessage } from './chat-message.model';

export interface Session {
  name: string;
  code: string;
  set: string;
  setName: string;
  players: [
    { id: string; name: string; characterName: string; avatarUrl: string },
  ];
  chat: ChatMessage[];
}
