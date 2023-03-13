import 'package:flutter/material.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-creation-service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';
import '../constants/create-lobby-constants.dart';

GameCreationService gameCreationService = getIt.get<GameCreationService>();

BehaviorSubject<List<PublicUser>> playerList$ =
    BehaviorSubject<List<PublicUser>>.seeded([]);

Stream<List<PublicUser>> get playerListStream => playerList$.stream;

BehaviorSubject<List<PublicUser>> playerWaitingList$ =
    BehaviorSubject<List<PublicUser>>.seeded([]);

Stream get playerWaitingListStream => playerWaitingList$.stream;

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

Future<bool> addPlayerToLobby(PublicUser player) async {
  if (playerList$.isClosed) reOpen();
  if (playerList.length >= MAX_PLAYER_COUNT) return false;

  await gameCreationService.handleAcceptOpponent(player);

  playerWaitingList.remove(player);
  playerList.add(player);
  playerList$.add(playerList);
  return true;
}

Future<void> refusePlayer(PublicUser player) async {
  await gameCreationService.handleRejectOpponent(player);
  playerWaitingList.remove(player);
}

Future<void> startGame() async {
  await gameCreationService.handleStartGame();
  playerList$.close();
}

Future<void> backOut() async {
  await gameCreationService.handleCancelGame();
  playerList$.close();
}

void reOpen() {
  playerList$ = BehaviorSubject<List<PublicUser>>.seeded(playerList);
}

bool isMinimumPlayerCount() {
  print(playerList$.value);
  return playerList$.value.length < MINIMUM_PLAYER_COUNT;
}
