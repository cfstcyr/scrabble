import 'dart:convert';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/group.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../constants/socket-events/group-events.dart';
import '../locator.dart';
import '../services/client.dart';
import '../services/socket.service.dart';

class GroupJoinController {
  final String endpoint = GAME_ENDPOINT;

  String? joinedGroupedId;

  SocketService socketService = getIt.get<SocketService>();
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();

  InterceptedHttp get http => httpClient.http;

  GroupJoinController._privateConstructor() {
    _configureSocket();
  }

  static final GroupJoinController _instance =
      GroupJoinController._privateConstructor();

  factory GroupJoinController() {
    return _instance;
  }

  Future<void> handleGetGroups() async {
    await http.get(Uri.parse(endpoint));
  }

  Future<Response> handleJoinGroup(String groupId) async {
    joinedGroupedId = groupId;
    return http.post(Uri.parse("$endpoint/$groupId/players/join"));
  }

  Future<Response> handleCancelJoinRequest() async {
    return handleLeaveGroup();
  }

  Future<Response> handleLeaveGroup() async {
    Future<Response> response =
        http.delete(Uri.parse("$endpoint/$joinedGroupedId/players/leave"));
    joinedGroupedId = null;
    return response;
  }

  void handleCurrentGroupUpdate(Group group) {
    currentGroupUpdate$.add(group);
  }

  void _configureSocket() {
    socketService.on(GROUP_UPDATE, (groups) async {
      handleGroupsUpdate(groups);
    });
    socketService.on(ACCEPTED_IN_GROUP,
        (group) => handleCurrentGroupUpdate(Group.fromJson(group)));
    socketService.on(REJECTED_FROM_GROUP,
        (host) => rejectedJoinRequest$.add(PublicUser.fromJson(host)));
    socketService.on(CANCELED_GROUP,
        (host) => canceledGroup$.add(PublicUser.fromJson(host)));

    socketService.on(USER_LEFT_GROUP,
        (group) => handleCurrentGroupUpdate(Group.fromJson(group)));
  }
}
