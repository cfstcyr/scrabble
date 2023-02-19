import 'package:flutter/material.dart';

import '../components/group-management.dart';
import '../components/parameters.dart';
import '../components/player-waiting-list.dart';
import '../components/waiting-room.dart';

class CreateLobbyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FractionallySizedBox(
        widthFactor: 1,
        heightFactor: 1,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Flexible(
              flex: 1,
              child: FractionallySizedBox(
                widthFactor: 0.6,
                heightFactor: 0.55,
                child: Container(
                  decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.black,
                      ),
                      color: Colors.white,
                      borderRadius: BorderRadius.all(Radius.circular(5.0))),
                  alignment: Alignment.center,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      children: <Widget>[
                        Expanded(
                          child: SizedBox(height: 5.0, child: WaitingRoom()),
                        ),
                        Parameters(),
                        GroupManagement(),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Flexible(
              flex: 1,
              child: FractionallySizedBox(
                  widthFactor: 0.6,
                  heightFactor: 0.6,
                  child: PlayerWaitingList()),
            ),
          ],
        ),
      ),
    );
  }
}
