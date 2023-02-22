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
    var theme = Theme.of(context);
    return Container(
      margin: EdgeInsets.fromLTRB(128, 64, 128, 64),
      decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: theme.colorScheme.onBackground, width: 2),
          borderRadius: BorderRadius.all(Radius.circular(20))),
      child: handleLobbyListChange(context),
    );
  }
}

StreamBuilder<List<Group>> handleLobbyListChange(BuildContext context) {
  GroupJoinService joinService = getIt.get<GroupJoinService>();
  var theme = Theme.of(context);
  return StreamBuilder<List<Group>>(
    stream: joinService.getGroups(),
    builder: (BuildContext context, AsyncSnapshot<List<Group>> snapshot) {
      List<Group> groups = snapshot.data == null || snapshot.data!.isEmpty
          ? snapshot.data!
          : List<Group>.of([]);
      print(groups);
      // return groups.isEmpty
      //     ? ListView(
      //         children: [ListTile(title: Text('Aucune partie disponible'))],
      //       )
      //     : ListView(
      //         children: groups
      //             .map((Group group) => ListTile(title: Text(group.groupId)))
      //             .toList(),
      //       );
      return Padding(
        padding: const EdgeInsets.fromLTRB(16, 32, 16, 32),
        child: Center(
          child: ListView(children: [
            Container(
              margin: EdgeInsets.only(bottom: 16),
              // padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                  color: theme.colorScheme.background,
                  borderRadius: BorderRadius.all(Radius.circular(8))),
              // padding: EdgeInsets.,
              child: IntrinsicHeight(
                child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Row(
                          children: List.generate(
                        4,
                        (index) => Container(
                          margin: EdgeInsets.fromLTRB(4, 8, 4, 4),
                          padding: EdgeInsets.only(bottom: 4),
                          child: IntrinsicWidth(
                            child: SizedBox(
                              width: 100,
                              child: Column(
                                // crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  FittedBox(
                                    fit: BoxFit.cover,
                                    child: CircleAvatar(
                                      radius: 32,
                                        backgroundImage: AssetImage(
                                            'images/avatar-12.png')),
                                  ),
                                  SizedBox(height: 4,),
                                  Center(
                                      child: Text(
                                    'Thomasssssssssss',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    softWrap: true,
                                  ))
                                ],
                              ),
                            ),
                          ),
                        ),
                      )),
                      VerticalDivider(
                        width: 32,
                        thickness: 2,
                        indent: 8,
                        endIndent: 8,
                        color: theme.colorScheme.tertiary,
                      ),
                      IntrinsicWidth(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            SizedBox(height: 8),
                            Expanded(
                              child: Container(
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                    color: theme.colorScheme.tertiary,
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(8))),
                                child: Padding(
                                  padding:
                                      const EdgeInsets.all(4),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.hourglass_bottom),
                                      SizedBox(width: 8),
                                      Text('1:00'),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(height: 8),
                            Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                    color: theme.colorScheme.tertiary,
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(8))),
                                child: Padding(
                                  padding:
                                      const EdgeInsets.fromLTRB(8, 4, 16, 4),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.precision_manufacturing),
                                      SizedBox(width: 8),
                                      Text('Débutant'),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(height: 8),
                          ],
                        ),
                      ),
                      SizedBox(
                        width: 32,
                      ),
                      Expanded(
                        child: Column(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            Expanded(
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceEvenly,
                                children: [
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Icon(Icons.visibility_outlined, size: 30),
                                      SizedBox(width: 4),
                                      Text(
                                        '3',
                                        style: TextStyle(fontSize: 24),
                                      )
                                    ],
                                  ),
                                  Icon(Icons.public, size: 40),
                                  ElevatedButton(
                                      onPressed: () {},
                                      style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              Colors.green.shade900,
                                          foregroundColor: Colors.white,
                                          // fixedSize: Size(60, 60),
                                          shape: BeveledRectangleBorder(
                                              borderRadius: BorderRadius.all(
                                                  Radius.circular(2)))),
                                      child: Icon(Icons.visibility, size: 40)),
                                  ElevatedButton(
                                      onPressed: () {},
                                      style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              Colors.green.shade900,
                                          foregroundColor: Colors.white,
                                          // fixedSize: Size(200, 40),
                                          shape: BeveledRectangleBorder(
                                              borderRadius: BorderRadius.all(
                                                  Radius.circular(2)))),
                                      child: Icon(Icons.play_arrow_outlined,
                                          size: 40)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ]),
              ),
            ),
            Container(
                margin: EdgeInsets.only(bottom: 16),
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: theme.colorScheme.background,
                    borderRadius: BorderRadius.all(Radius.circular(8))),
                // padding: EdgeInsets.,
                child: ListTile(
                    title: Center(child: Text('Aucune partie disponible')))),
          ]),
        ),
      );
    },
  );
}
