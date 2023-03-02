import 'package:flutter/material.dart';
import 'package:mobile/pages/home-page.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';
import '../constants/create-lobby-constants.dart';
import '../routes/routes.dart';

BehaviorSubject<List<PublicUser>> playerList$ =
    BehaviorSubject<List<PublicUser>>.seeded(playerList);
Stream<List<PublicUser>> get _stream => playerList$.stream;

List<PublicUser> playerWaitingList = [
// TODO : requete joueurs lobby
];

List<PublicUser> playerList = [
// TODO : requete joueurs lobby -- GET PROPRE USERNAME AVEC PAGE D'AVANT
];

ButtonStyle setStyleRoomButtons() {
  return ElevatedButton.styleFrom(
    backgroundColor: Colors.white,
    foregroundColor: Colors.green.shade900,
  );
}

ButtonStyle setStyleButtonToText([Color? backGroundColor]) {
  return ButtonStyle(
    foregroundColor: MaterialStateProperty.all(Colors.black),
    backgroundColor: MaterialStateProperty.all(backGroundColor ?? Colors.white),
  );
}

CircleAvatar setAvatar(String path) {
  return CircleAvatar(
      backgroundColor: Colors.transparent,
      radius: 23,
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

ButtonStyle setStyleMainActionButtons() {
  return ElevatedButton.styleFrom(
      backgroundColor: Colors.green.shade900,
      foregroundColor: Colors.white,
      fixedSize: Size(200, 40),
      shape: BeveledRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(2))));
}

ButtonStyle setStyleSecondaryActionButtons() {
  return ElevatedButton.styleFrom(
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      foregroundColor: Colors.black,
      fixedSize: Size(200, 40),
      shape: BeveledRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(2))));
}

Widget setWaitingPlayerIcon(int index) {
  return setAvatar(playerWaitingList[index].avatar);
}

bool addPlayerToLobby(PublicUser player) {
  if (playerList$.isClosed) reOpen();

  // TODO COTE SERVEUR req
  if (playerList.length >= MAX_PLAYER_COUNT) return false;
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
  Navigator.pushNamed(context, HOME_ROUTE);
}

void reOpen() {
  playerList$ = BehaviorSubject<List<PublicUser>>.seeded(playerList);
}

bool isMinimumPlayerCount() {
  print(playerList$.value);
  return playerList$.value.length < MINIMUM_PLAYER_COUNT;
}
