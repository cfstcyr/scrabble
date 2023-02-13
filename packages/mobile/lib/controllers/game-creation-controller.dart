import 'dart:convert';

import 'package:http/http.dart';
import 'package:mobile/environments/environment.dart';

import '../classes/player.dart';
import '../locator.dart';
import '../services/socket.service.dart';

class GameCreationController {
  GameCreationController._privateConstructor();

  static final GameCreationController _instance =
      GameCreationController._privateConstructor();

  factory GameCreationController() {
    return _instance;
  }
  SocketService socketService = getIt.get<SocketService>();

  final String endpoint = "${Environment().config.apiUrl}/games";

  Future<bool> handleAcceptOpponent(PlayerView opponent, String gameId) async {
    // TODO PAS LES BONS ENDPOINTS: accept est pour le bouton "démarrer la partie"
    Response res = await post(
        Uri.parse(
            "${endpoint}/${gameId}/players/${this.socketService.socket.id}/accept"),
        body: jsonEncode(opponent));
    // TODO: Remove hack
    return (res.statusCode == 200);
  }

  Future<bool> handleRejectOpponent(PlayerView opponent, String gameId) async {
    Response res = await post(
        Uri.parse(
            "${endpoint}/${gameId}/players/${this.socketService.socket.id}/reject"),
        body: jsonEncode(opponent));
    // TODO: Remove hack
    return (res.statusCode == 200);
  }
  // TODO
  // Future<bool> fillWithVirtualPlayers(String gameId) async {}
  // Future<bool> cancelGame(String gameId) async {}
}
