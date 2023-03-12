import 'dart:convert';

import 'package:http_interceptor/http/http.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/game/game-message.dart';
import 'package:mobile/classes/game/game-update.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/constants/socket-events/game-events.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:rxdart/rxdart.dart';

import '../services/client.dart';

class GamePlayController {
  GamePlayController._privateConstructor() {
    configureSocket();
  }

  static final GamePlayController _instance =
      GamePlayController._privateConstructor();

  factory GamePlayController() {
    return _instance;
  }

  final httpClient = getIt.get<PersonnalHttpClient>();
  SocketService socketService = getIt.get<SocketService>();

  final String baseEndpoint = GAME_ENDPOINT;
  InterceptedHttp get http => httpClient.http;

  String? currentGameId;

  Stream<void> get actionDoneEvent => _actionDone$.stream;

  Stream<GameUpdateData> get gameUpdateEvent => gameUpdate$.stream;

  Stream<GameMessage?> get messageEvent => gameMessage$.stream;

  final BehaviorSubject<GameUpdateData> gameUpdate$ =
      BehaviorSubject<GameUpdateData>();
  final BehaviorSubject<GameMessage?> gameMessage$ =
      BehaviorSubject<GameMessage?>.seeded(null);
  final PublishSubject<void> _actionDone$ = PublishSubject<void>();

  Future<void> sendAction(ActionData actionData) async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/action");
    http
        .post(endpoint, body: jsonEncode(actionData))
        .then((_) => _actionDone$.add(null));
  }

  Future<void> leaveGame() async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/leave");
    await http.delete(endpoint);
  }

  void configureSocket() {
    socketService.on(GAME_UPDATE_EVENT_NAME, (dynamic newData) {
      gameUpdate$.add(GameUpdateData.fromJson(newData));
    });
    socketService.on(GAME_MESSAGE_EVENT_NAME, (dynamic gameMessage) {
      gameMessage$.add(GameMessage.fromJson(gameMessage));
    });
  }
}
