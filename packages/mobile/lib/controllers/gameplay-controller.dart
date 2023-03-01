import 'package:http/http.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/actions/action-data.dart';
import '../constants/endpoint.constants.dart';
import '../constants/socket-events/game-events.dart';
import '../locator.dart';
import '../services/socket.service.dart';

class GameplayController {
  final String baseEndpoint = GAME_ENDPOINT;
  final Subject<void> _actionDone$ = PublishSubject();

  Stream<void> get actionDoneEvent => _actionDone$.stream;

  SocketService socketService = getIt.get<SocketService>();

  GameplayController._privateConstructor();

  static final GameplayController _instance =
      GameplayController._privateConstructor();

  factory GameplayController() {
    return _instance;
  }

  Future<void> sendAction(String gameId, ActionData actionData) async {
    Uri endpoint = Uri.parse("$baseEndpoint/$gameId/action");
    post(endpoint, body: actionData).then((_) => _actionDone$.add(null));
  }
}
