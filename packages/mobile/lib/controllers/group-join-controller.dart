import 'dart:convert';

import 'package:http/http.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/environments/environment.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../classes/group.dart';
import '../constants/socket-events/group-events.dart';
import '../locator.dart';
import '../services/socket.service.dart';

class GroupJoinController {
  final String endpoint = GAME_ENDPOINT;

  String? joinedGroupedId;

  SocketService socketService = getIt.get<SocketService>();

  GroupJoinController._privateConstructor() {
    _configureSocket();
  }

  static final GroupJoinController _instance =
  GroupJoinController._privateConstructor();

  factory GroupJoinController() {
    return _instance;
  }

  Future<void> handleGetGroups() async {
    await get(Uri.parse("$endpoint/${SocketService.socket.id}"));
  }

  Future<Response> handleJoinGroup(String groupId) async {
    // TODO Use UserService to get user's username
    String username = 'Player';
    joinedGroupedId = groupId;
    return post(Uri.parse(
        "$endpoint/games/$groupId/players/${SocketService.socket.id}/join"),
        body: { 'playerName': username});
  }

  Future<Response> handleCancelJoinRequest() async {
    return handleLeaveGroup();
  }

  Future<Response> handleLeaveGroup() async {
    Future<Response> response = delete(
        Uri.parse("$endpoint/games/$joinedGroupedId/players/${SocketService
            .socket.id}/leave"));
    joinedGroupedId = null;
    return response;
  }

  void _configureSocket() {
    socketService.on(GROUP_UPDATE, (groups) async {
      handleGroupsUpdate(groups);
    });
    socketService.on(ACCEPTED_IN_GROUP, (group) => acceptedJoinRequest$.add(group));
    socketService.on(
        REJECTED_FROM_GROUP, (hostName) => rejectedJoinRequest$.add(hostName));
    socketService.on(
        CANCELED_GROUP, (hostName) => canceledGroup$.add(hostName));

  }
}
