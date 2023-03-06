import 'dart:convert';

import 'package:http/http.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/environments/environment.dart';

import '../constants/socket-events/game-events.dart';
import '../locator.dart';
import '../services/socket.service.dart';

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

  final String endpoint = GAME_ENDPOINT;

  Future<bool> handleAcceptOpponent(PublicUser opponent, String gameId) async {
    // TODO PAS LES BONS ENDPOINTS: accept est pour le bouton "démarrer la partie"
    Response res = await post(
        Uri.parse(
            "${endpoint}/${gameId}/players/${SocketService.socket.id}/accept"),
        body: jsonEncode(opponent));
    // TODO: Remove hack
    return (res.statusCode == 200);
  }

  Future<bool> handleRejectOpponent(PublicUser opponent, String gameId) async {
    Response res = await post(
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
    Response res = await post(
        Uri.parse(
            "${endpoint}/${gameId}/players/${SocketService.socket.id}/accept"),
        body: jsonEncode(opponent));
    // TODO: Remove hack
    return (res.statusCode == 200);
  }

  void _configureSockets() {
    socketService.on(START_GAME_EVENT_NAME, (startGameData) {
      print(startGameData);
    });
  }
}
