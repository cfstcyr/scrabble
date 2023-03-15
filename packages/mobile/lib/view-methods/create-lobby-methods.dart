import 'package:flutter/material.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-creation-service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';
import '../constants/create-lobby-constants.dart';

GameCreationService gameCreationService = getIt.get<GameCreationService>();
UserService userService = getIt.get<UserService>();

BehaviorSubject<List<PublicUser>> playerList$ =
    BehaviorSubject<List<PublicUser>>.seeded([userService.getUser()]);

BehaviorSubject<List<PublicUser>> playerWaitingList$ =
    BehaviorSubject<List<PublicUser>>.seeded([]);

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
  return setAvatar(playerWaitingList$.value[index].avatar);
}

Future<bool> addPlayerToLobby(PublicUser player) async {
  if (isMaximumPlayerCount()) return false;

  await gameCreationService.handleAcceptOpponent(player);

  List<PublicUser> newPlayerWaitingList = playerWaitingList$.value;
  newPlayerWaitingList.remove(player);
  playerWaitingList$.add(newPlayerWaitingList);
  return true;
}

Future<void> refusePlayer(PublicUser player) async {
  await gameCreationService.handleRejectOpponent(player);
  List<PublicUser> newPlayerWaitingList = playerWaitingList$.value;
  newPlayerWaitingList.remove(player);
  playerWaitingList$.add(newPlayerWaitingList);
}

Future<void> startGame() async {
  await gameCreationService.handleStartGame();
}

Future<void> backOut() async {
  await gameCreationService.handleCancelGame();
}

bool isMinimumPlayerCount() {
  print(playerList$.value);
  return playerList$.value.length < MINIMUM_PLAYER_COUNT;
}

bool isMaximumPlayerCount() {
  int count = 0;
  playerList$.value.map((element) {
    if (element.email != '') count++;
  });
  return count >= MAX_PLAYER_COUNT;
}
