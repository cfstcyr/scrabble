import 'package:mobile/controllers/gameplay-controller.dart';

import '../classes/actions/action-data.dart';
import '../locator.dart';

class ActionService {
  bool _isActionBeingProcessed = false;

  bool get isActionBeingProcessed => _isActionBeingProcessed;

  GameplayController gameplayController = getIt.get<GameplayController>();

  ActionService._privateConstructor() {
    gameplayController.actionDoneEvent.listen((_) => _actionProcessed());
  }

  static final ActionService _instance = ActionService._privateConstructor();

  factory ActionService() {
    return _instance;
  }

  Future<void> sendAction(ActionType actionType, [ActionPayload? payload]) async {
    if (_isActionBeingProcessed) return;

    ActionData actionData = ActionData(type: actionType, payload: payload);

    gameplayController.sendAction(actionData);
    _isActionBeingProcessed = true;
  }

  void _actionProcessed() {
    _isActionBeingProcessed = false;
  }
}
