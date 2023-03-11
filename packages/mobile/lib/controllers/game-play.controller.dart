import 'dart:convert';
import 'dart:developer';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/game/game-update.dart';
import 'package:mobile/classes/message/message.dart';
import 'package:mobile/constants/endpoint.constants.dart';
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

  SocketService socketService = getIt.get<SocketService>();

  final String baseEndpoint = GAME_ENDPOINT;
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();
  InterceptedHttp get http => httpClient.http;

  String? currentGameId;

  final Subject<void> _actionDone$ = PublishSubject();

  Stream<void> get actionDoneEvent => _actionDone$.stream;

  final Subject<GameUpdateData> _gameUpdate$ = PublishSubject();

  Stream<GameUpdateData> get gameUpdateEvent => _gameUpdate$.stream;

  final Subject<Message?> _message$ = PublishSubject();

  Stream<Message?> get messageEvent => _message$.stream;

  final BehaviorSubject<GameUpdateData> gameUpdate$ =
      BehaviorSubject<GameUpdateData>();
  final BehaviorSubject<Message?> newMessage$ =
      BehaviorSubject<Message?>.seeded(null);
  final PublishSubject<void> actionDone$ = PublishSubject<void>();

  Future<void> sendAction(ActionData actionData) async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/action");
    http.post(endpoint, body: jsonEncode(actionData)).then((_) => _actionDone$.add(null));
  }

  Future<void> leaveGame() async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/leave");
    await http.delete(endpoint);
  }

  void sendMessage(String gameId, Message message) {
    http.post(Uri.parse("$baseEndpoint/$gameId/message"), body: jsonEncode(message))
        .then((response) {});
  }

  void sendError(String gameId, Message message) {
    final endpoint = "$baseEndpoint/$currentGameId/players/error";
    http.post(Uri.parse(endpoint), body: jsonEncode(message)).then((response) {});
  }

  void handleReconnection(String gameId, String newPlayerId) {
    final endpoint = "$baseEndpoint/$currentGameId/players/reconnect";
    post(Uri.parse(endpoint), body: jsonEncode({'newPlayerId': newPlayerId}))
        .then((response) {});
  }

  void handleDisconnection(String gameId) {
    final endpoint = "$baseEndpoint/$currentGameId/players/disconnect";
    delete(Uri.parse(endpoint)).then((response) {
      handleDisconnectResponse();
    }).catchError((error) {
      final errorMessage = error.toString();
      final statusCode = error.statusCode;
      if (statusCode != 0) throw Exception(errorMessage);
    });
  }

  Stream<GameUpdateData> observeGameUpdate() {
    return gameUpdate$.stream;
  }

  Stream<Message?> observeNewMessage() {
    return newMessage$.stream;
  }

  Stream<void> observeActionDone() {
    return actionDone$.stream;
  }

  void configureSocket() {
    socketService.on('gameUpdate', (dynamic newData) {
      log('gameUpdate');
      gameUpdate$.add(GameUpdateData.fromJson(newData));
    });
    socketService.on('newMessage', (dynamic newMessage) {
      newMessage$.add(Message.fromJson(newMessage));
    });
  }

  void handleDisconnectResponse() {
    return;
  }
}
