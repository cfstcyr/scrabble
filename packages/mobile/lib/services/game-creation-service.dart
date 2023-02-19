import 'package:mobile/classes/user.dart';
import 'package:mobile/controllers/game-creation-controller.dart';

import '../locator.dart';

class GameCreationService {
  GameCreationService._privateConstructor();

  static final GameCreationService _instance =
      GameCreationService._privateConstructor();

  factory GameCreationService() {
    return _instance;
  }
  final gameCreationController = getIt.get<GameCreationController>();
  Future<bool> createAccount(PublicUser opponent, String gameId) async {
    return await gameCreationController.handleAcceptOpponent(opponent, gameId);
  }
}
