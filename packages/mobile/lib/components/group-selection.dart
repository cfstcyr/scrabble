import 'package:flutter/material.dart';
import 'package:mobile/services/group-join.service.dart';

import '../classes/group.dart';
import '../classes/user.dart';
import '../constants/create-lobby-constants.dart';
import '../locator.dart';
import '../services/theme-color-service.dart';
import '../view-methods/create-lobby-methods.dart';

class GroupSelection extends StatelessWidget {
  const GroupSelection({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    ThemeColorService themeService = getIt.get<ThemeColorService>();
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Container(
          color: themeService.backgroundColor,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [handleLobbyListChange()],
          )),
    );
  }
}

StreamBuilder<List<Group>> handleLobbyListChange() {
  GroupJoinService joinService = getIt.get<GroupJoinService>();
  return StreamBuilder<List<Group>>(
    stream: joinService.getGroups(),
    builder: (BuildContext context, AsyncSnapshot<List<Group>> snapshot) {
      List<Group> groups =
          snapshot.data == null ? snapshot.data! : List<Group>.of([]);
      print(groups);
      return groups.isEmpty
          ? ListView(
              children: [ListTile(title: Text('Pas de groupes'))],
            )
          : ListView(
              children: groups
                  .map((Group group) => ListTile(title: Text(group.groupId)))
                  .toList(),
            );
    },
  );
}
