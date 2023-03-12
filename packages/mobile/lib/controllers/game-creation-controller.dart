import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/environments/environment.dart';

import '../classes/group.dart';
import '../locator.dart';
import '../services/client.dart';
import '../services/socket.service.dart';

class GameCreationController {
  GameCreationController._privateConstructor();

  static final GameCreationController _instance =
      GameCreationController._privateConstructor();

  factory GameCreationController() {
    return _instance;
  }
  SocketService socketService = getIt.get<SocketService>();
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();
  InterceptedHttp get http => httpClient.http;

  final String endpoint = "${Environment().config.apiUrl}/games";

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

  // TODO
  Future<bool> handleStartGame(PublicUser opponent, String gameId) async {
    // TODO PAS LES BONS ENDPOINTS: accept est pour le bouton "démarrer la partie"
    Response res = await http.post(
        Uri.parse(
            "${endpoint}/${gameId}/players/${SocketService.socket.id}/accept"),
        body: jsonEncode(opponent));
    // TODO: Remove hack
    return (res.statusCode == 200);
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

  Future<GroupCreationResponse> handleCreateGame(Group groupData) async {
    Response res = await http.post(Uri.parse(endpoint),
        body: groupData.GroupCreationDatatoJson());
    return GroupCreationResponse(
        isCreated: res.statusCode == HttpStatus.created,
        groupId: json.decode(res.body)["group"]["groupId"]);
  }
}
