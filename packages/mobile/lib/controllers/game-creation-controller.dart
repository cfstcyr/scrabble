import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/opponent.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/constants/socket-events/group-events.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/view-methods/create-lobby-methods.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../classes/game/game-config.dart';
import '../classes/group.dart';
import '../constants/socket-events/game-events.dart';
import '../locator.dart';
import '../services/client.dart';
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
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();
  InterceptedHttp get http => httpClient.http;

  final String endpoint = GAME_ENDPOINT;

  Future<Response> handleAcceptOpponent(PublicUser user, String gameId) async {
    Opponent opponent = Opponent(name: user.username);
    return await http.post(Uri.parse("$endpoint/$gameId/players/accept"),
        body: jsonEncode(opponent.toJson()));
  }

  Future<Response> handleRejectOpponent(PublicUser user, String gameId) async {
    Opponent opponent = Opponent(name: user.username);
    return await http.post(Uri.parse("$endpoint/$gameId/players/reject"),
        body: jsonEncode(opponent.toJson()));
  }

  Future<Response> handleStartGame(String gameId) async {
    return await http.post(Uri.parse("$endpoint/$gameId/players/start"));
  }

  Future<Response> handleCancelGame(String gameId) async {
    return await http.delete(Uri.parse("$endpoint/$gameId/players/cancel"));
  }

  Future<GroupCreationResponse> handleCreateGame(Group groupData) async {
    Response res = await http.post(Uri.parse(endpoint),
        body: jsonEncode(groupData.GroupCreationDatatoJson()));
    GroupCreationResponse response = GroupCreationResponse(
        isCreated: res.statusCode == HttpStatus.created,
        group: Group.fromJson(jsonDecode(res.body)["group"]));

    return response;
  }

  void _configureSockets() {
    socketService.on(START_GAME_EVENT_NAME, (startGameDataJson) {
      StartGameData startGameData = StartGameData.fromJson(startGameDataJson);
      getIt.get<GamePlayController>().currentGameId = startGameData.gameId;
      startGame$.add(InitializeGameData(
          localPlayerSocketId: SocketService.socket.id!,
          startGameData: startGameData));
    });
    socketService.on(JOIN_REQUEST, (data) {
      handleJoinRequest(PublicUser.usersFromJsonList(data));
    });
    socketService.on(JOIN_REQUEST_CANCELLED, (data) {
      handleJoinRequestCancelled(PublicUser.usersFromJsonList(data));
    });
  }

  void handleJoinRequest(List<PublicUser> data) {
    playerWaitingList$.add(data);
  }

  void handleJoinRequestCancelled(List<PublicUser> data) {
    playerWaitingList$.add(data);
  }
}
