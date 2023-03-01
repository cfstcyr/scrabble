import 'package:mobile/controllers/gameplay-controller.dart';

import '../classes/actions/action-data.dart';
import '../locator.dart';

class ActionService {
  bool _hasActionBeenPlayed = false;

  bool get hasActionBeenPlayed => _hasActionBeenPlayed;

  GameplayController gameplayController = getIt.get<GameplayController>();

  ActionService._privateConstructor() {
    gameplayController.actionDoneEvent.listen((_) => _actionProcessed());
  }

  static final ActionService _instance = ActionService._privateConstructor();

  factory ActionService() {
    return _instance;
  }

  ActionData createActionData(ActionType actionType, [ActionPayload? payload]) {
    return ActionData(type: actionType, payload: payload);
  }

  void sendAction(String gameId, ActionData actionData) {
    if (_hasActionBeenPlayed) return;

    gameplayController.sendAction(gameId, actionData);
    _hasActionBeenPlayed = true;
  }

  void _actionProcessed() {
    _hasActionBeenPlayed = false;
  }
}
