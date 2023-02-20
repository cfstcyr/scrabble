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
    await get(Uri.parse("$endpoint/${socketService.socket.id}"));
  }

  Future<Response> handleJoinGroup(String groupId) async {
    // TODO Use UserService to get user's username
    String username = 'Player';
    return await post(Uri.parse("$endpoint/games/$groupId/players/${socketService.socket.id}/join"), body: { 'playerName': username });
  }

  void _configureSocket() {
    socketService.on(GROUP_UPDATE, (List<Group> groups) => groups$.add(groups));
    socketService.on(REJECTED_FROM_GROUP, (String hostName) => rejectedJoinRequest$.add(hostName));
    socketService.on(CANCELED_GROUP, (String hostName) => canceledGroup$.add(hostName));
  }
}
