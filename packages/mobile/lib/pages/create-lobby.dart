import 'package:flutter/material.dart';

import '../components/group-management.dart';
import '../components/parameters.dart';
import '../components/player-waiting-list.dart';
import '../components/waiting-room.dart';

class CreateLobbyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Salle d'attente"),
        shadowColor: Colors.black,
        backgroundColor: Colors.white,
        elevation: 1,
        automaticallyImplyLeading: false,
        centerTitle: true,
      ),
      body: FractionallySizedBox(
        widthFactor: 1,
        heightFactor: 1,
        child: Stack(
          alignment: FractionalOffset.center,
          children: <Widget>[
            Flexible(
              flex: 0,
              child: FractionallySizedBox(
                widthFactor: 0.35,
                heightFactor: 0.6,
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
              child: Align(
                alignment: Alignment.centerRight,
                child: FractionallySizedBox(
                    alignment: Alignment.centerRight,
                    widthFactor: 0.35,
                    heightFactor: 0.6,
                    child: PlayerWaitingList()),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
