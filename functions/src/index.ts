import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const firestore = admin.firestore();

export const joinLobbyC = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'This function can only be called by authorized users',
    );
  }
  const uid = context.auth.uid;
  const lobbyCode: string = data.lobbyId.toUpperCase();
  let lobbyId: string;
  return firestore
    .collection('sessions')
    .where('code', '==', lobbyCode)
    .get()
    .then((lobbyDocument) => {
      lobbyId = lobbyDocument.docs[0].id;
      const inSession = lobbyDocument.docs[0]
        .data()
        .players.filter((p: any) => p.id !== uid);
      const existingNameOrAvatar = inSession.find(
        (p: any) => p.name === data.nickname || p.avatarUrl === data.avatarUrl,
      );
      if (existingNameOrAvatar) {
        throw new functions.https.HttpsError(
          'already-exists',
          'U sobi se već nalazi korisnik sa istim imenom ili likom kao što ste vi izabrali.',
        );
      }
      inSession.push({
        name: data.nickname,
        avatarUrl: data.avatarUrl,
        characterName: data.characterName,
        id: uid,
      });
      return firestore
        .collection('sessions')
        .doc(lobbyId)
        .update({ players: inSession });
    })
    .then(() => {
      return { sessionId: lobbyId };
    });
});

export const leaveLobby = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'This function can only be called by authorized users',
    );
  }
  const uid = context.auth.uid;
  const sessionId: string = data.sessionId;
  return firestore
    .doc(`sessions/${sessionId}`)
    .get()
    .then((lobbyDocument) => {
      const docData = lobbyDocument.data();
      if (!docData) {
        throw new functions.https.HttpsError(
          'not-found',
          'Could not find lobby you are trying to leave',
        );
      }
      const playersWithoutCurrent = docData.players.filter(
        (p: any) => p.id !== uid,
      );
      return firestore
        .doc(`sessions/${sessionId}`)
        .update({ players: playersWithoutCurrent });
    })
    .then(() => {
      return {};
    });
});

export const sendMessage = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'This function can only be called by authorized users',
    );
  }
  const uid = context.auth.uid;
  const sessionId: string = data.sessionId;
  return firestore
    .doc(`sessions/${sessionId}`)
    .get()
    .then((lobbyDocument) => {
      const docData = lobbyDocument.data();
      if (docData === undefined) {
        throw new functions.https.HttpsError(
          'not-found',
          'The lobby you tried to send a message to was not found',
        );
      }
      const player = docData.players.find((p: any) => p.id === uid);
      if (!player) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You are not inside the lobby you are trying to send a message to',
        );
      }
      const chat = docData.chat || [];
      chat.push({
        id: player.id,
        name: player.name,
        avatarUrl: player.avatarUrl,
        message: data.message,
        time: Date.now(),
      });
      return firestore.doc(`sessions/${sessionId}`).update({ chat });
    })
    .then(() => {
      return {};
    });
});
