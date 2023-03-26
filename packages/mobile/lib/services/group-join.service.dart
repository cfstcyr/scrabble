import 'dart:io';

import 'package:http/http.dart';

import '../controllers/group-join-controller.dart';
import '../locator.dart';
import '../view-methods/group.methods.dart';

class GroupJoinService {
  final GroupJoinController groupJoinController =
      getIt.get<GroupJoinController>();

  GroupJoinService._privateConstructor();

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

  void joinGroup(String groupId,
      {String password = '', bool isObserver = false}) async {
    await groupJoinController.handleJoinGroup(groupId, password, isObserver);
  }

  Future<bool> handleJoinGroup(
      String groupId, String password, bool isObserver) async {
    Response res = await groupJoinController.handleJoinGroup(
        groupId, password, isObserver);
    print(res.statusCode);
    if (res.statusCode == HttpStatus.unauthorized) {
      fullGroup$.add(false);
    }
    ;
    //   .then((_) => true)
    //   .catchError((error) {
    // _handleJoinError(error);
    return res.statusCode == HttpStatus.noContent;
    // });
  }

  Future<bool> handleGroupUpdatesRequest(
      String groupId, bool isObserver) async {
    Response res = await groupJoinController.handleGroupUpdatesRequest(
        groupId, isObserver);
    return res.statusCode == HttpStatus.created;
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
