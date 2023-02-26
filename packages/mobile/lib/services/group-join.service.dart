import 'package:flutter/material.dart';
import 'package:mobile/pages/groups-page.dart';
import 'package:mobile/routes/navigator-key.dart';

import '../classes/group.dart';
import '../controllers/group-join-controller.dart';
import '../locator.dart';
import '../pages/groups-request-waiting-page.dart';
import '../pages/join-waiting-page.dart';
import '../view-methods/group.methods.dart';

class GroupJoinService {
  final GroupJoinController groupJoinController = getIt.get<GroupJoinController>();

  GroupJoinService._privateConstructor() {
    acceptedStream.listen((Group group) {
    Navigator.pushReplacement(
          navigatorKey.currentContext!, MaterialPageRoute(builder: (context) => JoinWaitingPage(currentGroup: group)));
      closeSubject(acceptedJoinRequest$);
    });

    rejectedJoinRequest$.listen((String hostname) {
      showDialog<void>(
        context: navigatorKey.currentContext!,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Demande rejetée'),
            surfaceTintColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            content: SingleChildScrollView(
              child: ListBody(
                children: <Widget>[
                  Text("$hostname a rejeté votre demande", style: TextStyle(fontSize: 16)),
                ],
              ),
            ),
            actions: <Widget>[
              TextButton(
                child: const Text('Ok'),
                onPressed: () {
                  Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => GroupPage()));
                },
              ),
            ],
          );
        },
      );
    });
  }

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
