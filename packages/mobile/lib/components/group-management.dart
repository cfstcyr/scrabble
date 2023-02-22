import 'package:flutter/material.dart';

import '../classes/user.dart';
import '../constants/create-lobby-constants.dart';
import '../view-methods/create-lobby-methods.dart';

class GroupManagement extends StatelessWidget {
  const GroupManagement({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Container(
          child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          ElevatedButton.icon(
              onPressed: () {
                backOut(context);
              },
              style: setStyleSecondaryActionButtons(),
              icon: Icon(
                Icons.keyboard_arrow_left_sharp,
                size: 20,
              ),
              label: Text(
                STOP_GAME_SETUP,
                style: TextStyle(fontSize: 15),
              )),
          handleStartGameButton()
        ],
      )),
    );
  }
}

StreamBuilder<List<PublicUser>> handleStartGameButton() {
  return StreamBuilder<List<PublicUser>>(
    stream: playerList$,
    builder: (BuildContext context, AsyncSnapshot<List<PublicUser>> snapshot) {
      return ElevatedButton.icon(
          onPressed: isMinimumPlayerCount()
              ? null
              : () {
                  startGame(context);
                },
          style: setStyleMainActionButtons(),
          icon: Icon(Icons.start, size: 20),
          label: Text(
            START_GAME,
            style: TextStyle(fontSize: 15),
          ));
    },
  );
}
