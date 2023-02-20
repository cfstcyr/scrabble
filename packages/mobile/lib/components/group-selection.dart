import 'package:flutter/material.dart';

import '../classes/user.dart';
import '../constants/create-lobby-constants.dart';
import '../view-methods/create-lobby-methods.dart';

class GroupSelection extends StatelessWidget {
  const GroupSelection({
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
          handleLobbyListChange()
        ],
      )),
    );
  }
}

StreamBuilder<List<PublicUser>> handleLobbyListChange() {
  return StreamBuilder<List<PublicUser>>(
    stream: playerList$,
    builder: (BuildContext context, AsyncSnapshot<List<PublicUser>> snapshot) {
      return ElevatedButton.icon(
          onPressed: playerList$.value.length < 2
              ? null
              : () {
                  startGame(context);
                },
          style: setStyleActionButtons(),
          icon: Icon(Icons.start),
          label: Text(START_GAME));
    },
  );
}
