import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/group-join.service.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../classes/group.dart';
import '../components/group/parameters.dart';
import '../components/group/waiting-room.dart';
import '../constants/locale/group-selection-constants.dart';
import '../constants/locale/groups-constants.dart';

class JoinWaitingPage extends StatefulWidget {
  JoinWaitingPage({super.key, required this.currentGroup});

  Group currentGroup;

  @override
  State<JoinWaitingPage> createState() => _JoinWaitingPageState();
}

class _JoinWaitingPageState extends State<JoinWaitingPage> {
  late StreamSubscription groupUpdateSubscription;
  late StreamSubscription canceledSubscription;

  @override
  void initState() {
    super.initState();

    groupUpdateSubscription = currentGroupUpdateStream.listen((Group group) {
      widget.currentGroup = group;
    });

    canceledSubscription = canceledStream.listen((PublicUser host) {
      triggerDialogBox("Partie annulée", [
        Text("${host.username} a annulé la partie",
            style: TextStyle(fontSize: 16))
      ], [
        DialogBoxButtonParameters(
            content: 'OK',
            theme: AppButtonTheme.primary,
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, GROUPS_ROUTE);
            })
      ]);
    });
  }

  @override
  void dispose() {
    super.dispose();
    groupUpdateSubscription.cancel();
    canceledSubscription.cancel();
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);

    return WillPopScope(
      child: MyScaffold(
          title: WAITING_ROOM_TITLE,
          body: FractionallySizedBox(
            widthFactor: 1,
            heightFactor: 1,
            child: Flex(
              direction: Axis.horizontal,
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Flexible(
                  flex: 1,
                  child: FractionallySizedBox(
                    widthFactor: 0.5,
                    heightFactor: 0.7,
                    child: Container(
                      decoration: BoxDecoration(
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.5),
                              spreadRadius: 2,
                              blurRadius: 7,
                              offset: Offset(0, 3),
                            ),
                          ],
                          color: Colors.white,
                          borderRadius: BorderRadius.all(Radius.circular(5.0))),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          children: <Widget>[
                            Text(GAME_GROUP_TITLE,
                                style: TextStyle(fontSize: 18)),
                            Expanded(
                              child: WaitingRoom(
                                virtualPlayerLevel:
                                    widget.currentGroup.virtualPlayerLevel,
                              ),
                            ),
                            Row(children: <Widget>[
                              Expanded(
                                child: Divider(
                                  height: 10,
                                  thickness: 2,
                                  indent: 5,
                                  endIndent: 5,
                                  color: Colors.grey.shade500,
                                ),
                              ),
                              Text(GAME_PARAMETERS_TITLE),
                              Expanded(
                                child: Divider(
                                  height: 10,
                                  thickness: 2,
                                  indent: 5,
                                  endIndent: 5,
                                  color: Colors.grey.shade500,
                                ),
                              ),
                            ]),
                            Parameters(
                                maxRoundTime: widget.currentGroup.maxRoundTime,
                                virtualPlayerLevel:
                                    widget.currentGroup.virtualPlayerLevel),
                            AppButton(
                              onPressed: () {
                                _onBack(context, widget.currentGroup.groupId!);
                              },
                              icon: Icons.keyboard_arrow_left_sharp,
                              text: QUIT_GROUP,
                              theme: AppButtonTheme.primary,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          )),
      onWillPop: () => _onBack(context, widget.currentGroup.groupId!),
    );
  }

  Future<bool> _onBack(BuildContext context, String groupId) {
    getIt.get<GroupJoinService>().handleLeaveGroup(groupId);
    Navigator.pop(context);
    return Future.value(true);
  }
}
