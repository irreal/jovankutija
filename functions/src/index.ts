import * as functions from 'firebase-functions';
import * as cors from 'cors';
import * as admin from 'firebase-admin';
const corsHandler = cors({ origin: true });
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();
const firestore = admin.firestore();
export const helloWorld = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    response.send({ message: 'Hello from Firebase!' });
    return firestore.collection('sets').doc('newset').create({
      something: 'kul',
      somethingElse: 'also cool',
    });
  });
});

export const joinLobby = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    const lobbyCode: string = request.body.lobbyId;
    let lobbyId: string;
    return firestore
      .collection('sessions')
      .where('code', '==', lobbyCode)
      .get()
      .then((lobbyDocument) => {
        lobbyId = lobbyDocument.docs[0].id;
        const inSession = lobbyDocument.docs[0].data().players;
        inSession.push({
          name: request.body.nickname,
          character: request.body.character,
        });
        return firestore
          .collection('sessions')
          .doc(lobbyId)
          .update({ ...lobbyDocument.docs[0].data(), players: inSession });
      })
      .then(() => {
        response.send({ sessionId: lobbyId });
      });
  });
});
