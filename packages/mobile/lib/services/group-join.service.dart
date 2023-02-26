import 'dart:io';

import 'package:http/http.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/controllers/game-creation-controller.dart';

import '../classes/group.dart';
import '../constants/game-constants.dart';
import '../controllers/group-join-controller.dart';
import '../locator.dart';
import '../view-methods/group.methods.dart';

class GroupJoinService {
  final GroupJoinController groupJoinController = getIt.get<GroupJoinController>();

  GroupJoinService._privateConstructor();

  static final GroupJoinService _instance =
      GroupJoinService._privateConstructor();

  factory GroupJoinService() {
    return _instance;
  }

  void getGroups() async {
    await groupJoinController.handleGetGroups().catchError((_) => groups$.add([]));
  }

  void joinGroup(String groupId) async {
    await groupJoinController.handleJoinGroup(groupId);
  }

  Future<bool> handleJoinGroup(String groupId) async {
    return await groupJoinController
        .handleJoinGroup(groupId)
        .then((_) => true)
        .catchError((error) {
      _handleJoinError(error);
      return false;
    });
  }

  void _handleJoinError(int statusCode) {
    print(statusCode);
  }
}
