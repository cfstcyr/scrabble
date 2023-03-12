import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/pages/groups-page.dart';
import 'package:mobile/routes/navigator-key.dart';

import '../classes/group.dart';
import '../components/app_button.dart';
import '../controllers/group-join-controller.dart';
import '../locator.dart';
import '../pages/group-waiting-page.dart';
import '../view-methods/group.methods.dart';

class GroupJoinService {
  final GroupJoinController groupJoinController =
      getIt.get<GroupJoinController>();

  GroupJoinService._privateConstructor() {





  }

  static final GroupJoinService _instance =
      GroupJoinService._privateConstructor();

  factory GroupJoinService() {
    return _instance;
  }

  void getGroups() async {
    await groupJoinController
        .handleGetGroups()
        .catchError((_) => groups$.add([]));
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

  Future<void> handleLeaveGroup() async {
    await groupJoinController.handleLeaveGroup();
  }

  Future<bool> handleCancelJoinRequest() async {
    return await groupJoinController
        .handleCancelJoinRequest()
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
