import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/components/chatbox.dart';
import 'package:mobile/services/group-join.service.dart';

import '../components/group-selection.dart';
import '../components/invalid-connection-popup.dart';
import '../locator.dart';
import 'create-lobby.dart';

class GroupPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    GroupJoinService groupJoinService = getIt.get<GroupJoinService>();
    groupJoinService.getGroups();

    return Scaffold(
        appBar: AppBar(
          title: Text("Rejoindre une partie"),
          backgroundColor: Colors.white,
          centerTitle: true,
          surfaceTintColor: Colors.white,
          iconTheme: IconThemeData(color: theme.primaryColor),
        ),
        body: Center(child: GroupSelection()), backgroundColor: theme.colorScheme.background);
  }
}
