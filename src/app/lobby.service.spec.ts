import { TestBed } from '@angular/core/testing';

import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
  let service: LobbyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: LobbyService, useValue: {}}]
    });
    service = TestBed.inject(LobbyService);
  });

  it('should be created', () => {
    expect(service).toBeTrue();
  });
});
