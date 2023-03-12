import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../classes/group.dart';
import '../components/group/parameters.dart';
import '../components/group/waiting-room.dart';
import '../constants/locale/group-selection-constants.dart';
import '../constants/locale/groups-constants.dart';
import '../view-methods/create-lobby-methods.dart';

class JoinWaitingPage extends StatefulWidget {
  const JoinWaitingPage({super.key, required this.currentGroup});

  final Group currentGroup;

  @override
  State<JoinWaitingPage> createState() => _JoinWaitingPageState();
}

class _JoinWaitingPageState extends State<JoinWaitingPage> {
  @override
  void initState() {
    super.initState();
    reOpenSubject(playerList$);
    playerList$.add(widget.currentGroup.users);
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);

    return Scaffold(
        appBar: AppBar(
          title: Text(WAITING_ROOM_TITLE),
          shadowColor: Colors.black,
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 1,
          automaticallyImplyLeading: false,
          centerTitle: true,
        ),
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
                          AppButton(onPressed: () {
                            Navigator.pop(context);
                          },
                          icon: Icons.keyboard_arrow_left_sharp,
                          text: QUIT_GROUP,
                          theme: AppButtonTheme.primary,),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        backgroundColor: theme.colorScheme.background);
  }
}
