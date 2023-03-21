import 'package:mobile/controllers/game-play.controller.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/actions/action-data.dart';
import '../constants/game-events.dart';
import '../locator.dart';
import 'game-event.service.dart';

class ActionService {
  BehaviorSubject<bool> _isActionBeingProcessed = BehaviorSubject.seeded(false);

  ValueStream<bool> get isActionBeingProcessedStream =>
      _isActionBeingProcessed.stream;
  bool get isActionBeingProcessed => _isActionBeingProcessed.value;

  GamePlayController gameplayController = getIt.get<GamePlayController>();
  final GameEventService _gameEventService = getIt.get<GameEventService>();

  ActionService._privateConstructor() {
    gameplayController.actionDoneEvent.listen((_) => _actionProcessed());
  }

  static final ActionService _instance = ActionService._privateConstructor();

  factory ActionService() {
    return _instance;
  }

  Future<void> sendAction(ActionType actionType,
      [ActionPayload? payload]) async {
    if (isActionBeingProcessed) return;

    ActionData actionData = ActionData(type: actionType, payload: payload);

    gameplayController.sendAction(actionData);
    _isActionBeingProcessed.add(true);
  }

  void _actionProcessed() {
    _isActionBeingProcessed.add(false);

    // remove tiles on board after an invalid word
    _gameEventService.add<void>(PUT_BACK_TILES_ON_TILE_RACK, null);
  }
}
