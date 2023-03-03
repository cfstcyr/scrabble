import 'package:flutter/material.dart';

import '../classes/virtual-player-level.dart';
import '../components/group/group-management.dart';
import '../components/group/parameters.dart';
import '../components/group/player-waiting-list.dart';
import '../components/group/waiting-room.dart';
import '../components/scaffold-persistance.dart';

class CreateLobbyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: "Salle d'attente",
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
                widthFactor: 0.75,
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
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.all(Radius.circular(5.0))),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      children: <Widget>[
                        Text("Groupe de partie",
                            style: TextStyle(fontSize: 18)),
                        Expanded(
                          child: WaitingRoom(
                              virtualPlayerLevel: VirtualPlayerLevel.beginner),
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
                          Text("Paramètres de partie"),
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
                        Parameters(),
                        GroupManagement(),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(width: 50),
            Flexible(
              flex: 1,
              child: FractionallySizedBox(
                  widthFactor: 0.75,
                  heightFactor: 0.7,
                  child: Padding(
                    padding: EdgeInsets.only(
                        left: 0, right: 15.0, top: 0, bottom: 0),
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
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.all(Radius.circular(1.0))),
                      child: Column(
                        children: [
                          Text("Liste d'attente",
                              style: TextStyle(fontSize: 18)),
                          Expanded(child: PlayerWaitingList()),
                        ],
                      ),
                    ),
                  )),
            ),
          ],
        ),
      ),
    );
  }
}
