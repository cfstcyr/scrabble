import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/pages/join-waiting-page.dart';
import 'package:mobile/services/group-join.service.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../classes/group.dart';
import '../components/group-selection.dart';
import '../locator.dart';

class GroupPage extends StatefulWidget {
  @override
  State<GroupPage> createState() => _GroupPageState();
}

class _GroupPageState extends State<GroupPage> {
  GroupJoinService groupJoinService = getIt.get<GroupJoinService>();
  StreamSubscription? acceptedSubscription;

  @override
  void initState() {
    print('init');
    groupJoinService.getGroups();
    acceptedSubscription = acceptedJoinRequest$.listen((Group group) async {
      Navigator.push(
          context, MaterialPageRoute(builder: (context) => JoinWaitingPage(currentGroup: group)));
    });
    super.initState();
  }

  @override
  void deactivate() {
    if (acceptedSubscription != null) {
      print('deactivate');
      acceptedSubscription!.cancel();
    }
    super.deactivate();
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);

    return Scaffold(
        appBar: AppBar(
          title: Text("Rejoindre une partie"),
          backgroundColor: Colors.white,
          centerTitle: true,
          surfaceTintColor: Colors.white,
          iconTheme: IconThemeData(color: theme.primaryColor),
        ),
        body: Center(child: GroupSelection()),
        backgroundColor: theme.colorScheme.background);
  }
}
