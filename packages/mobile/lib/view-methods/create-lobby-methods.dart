import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';
import '../pages/prototype-page.dart';

BehaviorSubject<List<PublicUser>> playerList$ =
    BehaviorSubject<List<PublicUser>>.seeded(playerList);
Stream<List<PublicUser>> get _stream => playerList$.stream;

List<PublicUser> playerWaitingList = [
// TODO : requete joueurs lobby
  PublicUser(username: "michel"),
  PublicUser(username: "ppman"),
  PublicUser(username: "ppman1"),
  PublicUser(username: "ppman2"),
  PublicUser(username: "ppman3"),
  PublicUser(username: "ppman4"),
];

List<PublicUser> playerList = [
// TODO : requete joueurs lobby -- GET PROPRE USERNAME AVEC PAGE D'AVANT
  PublicUser(username: "michel"),
];

ButtonStyle setStyleRoomButtons() {
  return ElevatedButton.styleFrom(
    backgroundColor: Colors.grey.shade200,
    foregroundColor: Colors.green.shade900,
  );
}

CircleAvatar setAvatar(String path) {
  return CircleAvatar(
      backgroundColor: Colors.transparent,
      child: SizedBox(
          child: ClipOval(
        child: Image.asset(
          path, //TODO IMAGES PAS POSSIBLE COTE SERVEUR BCS ON DOIT LES RAJOUTER 1 PAR 1 DANS LE pubspec.yaml
        ),
      )));
}

ButtonStyle setStyleWaitingListButtons() {
  return ElevatedButton.styleFrom(
      foregroundColor: Colors.black, shape: CircleBorder());
}

ButtonStyle setStyleActionButtons() {
  return ElevatedButton.styleFrom(
      backgroundColor: Colors.green.shade900,
      foregroundColor: Colors.white,
      shape: BeveledRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(2))));
}

Widget setWaitingPlayerIcon(int index) {
  return setAvatar(playerWaitingList[index].avatar);
}

bool addPlayerToLobby(PublicUser player) {
  // TODO COTE SERVEUR req
  if (playerList.length > 3) return false;
  playerWaitingList.remove(player);
  playerList.add(player);
  playerList$.add(playerList);
  return true;
}

void refusePlayer(PublicUser player) {
  // TODO COTE SERVEUR req
  playerWaitingList.remove(player);
}

void startGame(BuildContext context) {
  // TODO socket + redirection game page
  playerList$.close();
}

void backOut(BuildContext context) {
  // TODO socket close lobby
  playerList$.close();
  Navigator.push(
    context,
    MaterialPageRoute(builder: (context) => PrototypePage()),
  );
}
