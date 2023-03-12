import 'dart:convert';
import 'dart:developer';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../classes/game/game-config.dart';
import '../constants/socket-events/game-events.dart';
import '../locator.dart';
import '../services/client.dart';
import '../services/socket.service.dart';
import '../services/storage.handler.dart';

class GameCreationController {
  GameCreationController._privateConstructor() {
    _configureSockets();
  }

  static final GameCreationController _instance =
      GameCreationController._privateConstructor();

  factory GameCreationController() {
    return _instance;
  }

  SocketService socketService = getIt.get<SocketService>();
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();
  InterceptedHttp get http => httpClient.http;

  final String endpoint = GAME_ENDPOINT;

  Future<bool> handleAcceptOpponent(PublicUser opponent, String gameId) async {
    // TODO PAS LES BONS ENDPOINTS: accept est pour le bouton "démarrer la partie"
    Response res = await http.post(
        Uri.parse(
            "$endpoint/$gameId/players/${SocketService.socket.id}/accept"),
        body: jsonEncode(opponent));
    // TODO: Remove hack
    return (res.statusCode == 200);
  }

  Future<bool> handleRejectOpponent(PublicUser opponent, String gameId) async {
    Response res = await http.post(
        Uri.parse(
            "${endpoint}/${gameId}/players/${SocketService.socket.id}/reject"),
        body: jsonEncode(opponent));
    // TODO: Remove hack
    return (res.statusCode == 200);
  }

  Future<Response> handleStartGame(String gameId) async {
    return await post(Uri.parse("$endpoint/$gameId/players/start"));
  }

  // TODO
  Future<bool> handleCancelGame(PublicUser opponent, String gameId) async {
    // TODO PAS LES BONS ENDPOINTS: accept est pour le bouton "démarrer la partie"
    Response res = await http.post(
        Uri.parse(
            "${endpoint}/${gameId}/players/${SocketService.socket.id}/accept"),
        body: jsonEncode(opponent));
    // TODO: Remove hack
    return (res.statusCode == 200);
  }

  Future<String> handleCreateGame() async {
    Response res = await post(Uri.parse(endpoint),
        body: jsonEncode({
          'gameVisibility': 'public',
          'groupId': '5f9f1b9b0e2c4c0004e1b0e0',
          'maxRoundTime': 60,
          'password': ''
        }));
    return res.body;
  }

  void _configureSockets() {
    socketService.on(START_GAME_EVENT_NAME, (startGameDataJson) {
      StartGameData startGameData = StartGameData.fromJson(startGameDataJson);
      getIt.get<GamePlayController>().currentGameId = startGameData.gameId;
      startGame$.add(InitializeGameData(
          localPlayerSocketId: SocketService.socket.id!,
          startGameData: startGameData));
    });
  }
}
