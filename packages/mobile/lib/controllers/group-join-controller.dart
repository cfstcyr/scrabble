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

  void _configureSocket() {
    socketService.on(GROUP_UPDATE, (List<Group> groups) => groups$.add(groups));
  }
}
