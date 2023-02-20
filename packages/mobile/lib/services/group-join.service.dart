import 'dart:io';

import 'package:http/http.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/controllers/game-creation-controller.dart';

import '../classes/group.dart';
import '../constants/game.dart';
import '../controllers/group-join-controller.dart';
import '../locator.dart';
import '../view-methods/group.methods.dart';

class GroupJoinService {
  final groupJoinController = getIt.get<GroupJoinController>();

  GroupJoinService._privateConstructor();

  static final GroupJoinService _instance =
      GroupJoinService._privateConstructor();

  factory GroupJoinService() {
    return _instance;
  }

  Stream<List<Group>> getGroups() {
    print(groups$.last);
    return groups$.map((List<Group> groups) {
      for (Group group in groups) {
        group.canJoin = group.users.length > MAX_GROUP_SIZE;
      }

      return groups;
    });
  }

  void handleGetGroups() async {
    await groupJoinController.handleGetGroups();
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
