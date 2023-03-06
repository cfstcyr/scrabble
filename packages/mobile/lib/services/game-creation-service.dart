import 'dart:async';

import 'package:mobile/classes/user.dart';
import 'package:mobile/controllers/game-creation-controller.dart';

import '../components/error-pop-up.dart';
import '../constants/locale/groups-constants.dart';
import '../locator.dart';
import '../routes/navigator-key.dart';

class GameCreationService {
  String? groupId;

  GameCreationService._privateConstructor();

  static final GameCreationService _instance =
      GameCreationService._privateConstructor();

  factory GameCreationService() {
    return _instance;
  }

  final gameCreationController = getIt.get<GameCreationController>();

  void handleStartGame() {
    if (groupId == null) return;

    gameCreationController.handleStartGame(groupId!).catchError((error) {
      errorSnackBar(navigatorKey.currentContext!, GAME_START_FAILED);
      return error;
    });
  }
}
