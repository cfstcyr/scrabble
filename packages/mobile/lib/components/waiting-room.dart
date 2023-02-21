import 'package:flutter/material.dart';

import '../classes/user.dart';
import '../view-methods/create-lobby-methods.dart';
import 'error-pop-up.dart';

class WaitingRoom extends StatefulWidget {
  const WaitingRoom({
    super.key,
  });

  @override
  State<WaitingRoom> createState() => _WaitingRoomState();
}

class _WaitingRoomState extends State<WaitingRoom> {
  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var style = theme.textTheme.displayMedium!.copyWith(
      color: theme.colorScheme.onPrimary,
    );

    return Padding(
        padding: EdgeInsets.only(left: 0, right: 0, top: 50.0, bottom: 50.0),
        child: Container(
          alignment: Alignment.center,
          child: handlePlayerListChange(),
        ));
  }
}

StreamBuilder<List<PublicUser>> handlePlayerListChange() {
  return StreamBuilder<List<PublicUser>>(
    stream: playerList$,
    builder: (BuildContext context, AsyncSnapshot<List<PublicUser>> snapshot) {
      if (snapshot.hasError) {
        return ErrorPopup(
            errorMessage: 'Error: ${snapshot.error}'
                'Stack trace: ${snapshot.stackTrace}');
      }
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              SizedBox(
                height: 50,
                width: 140,
                child: ElevatedButton.icon(
                    onPressed: () {},
                    style: setStyleRoomButtons(),
                    icon: setPlayerIcon(0),
                    label: setPlayerName(0)),
              ),
              SizedBox(
                height: 50,
                width: 140,
                child: ElevatedButton.icon(
                    onPressed: () {},
                    style: setStyleRoomButtons(),
                    icon: setPlayerIcon(1),
                    label: setPlayerName(1)),
              ),
            ],
          ),
          Text("vs", style: TextStyle(fontWeight: FontWeight.bold)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              SizedBox(
                  height: 50,
                  width: 140,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    style: setStyleRoomButtons(),
                    icon: setPlayerIcon(2),
                    label: setPlayerName(2),
                  )),
              SizedBox(
                height: 50,
                width: 140,
                child: ElevatedButton.icon(
                    onPressed: () {},
                    style: setStyleRoomButtons(),
                    icon: setPlayerIcon(3),
                    label: setPlayerName(3)),
              ),
            ],
          ),
        ],
      );
    },
  );
}

Widget setPlayerIcon(int index) {
  return playerList$.value.length > index
      ? setAvatar(playerList$.value[index].avatar)
      : Icon(Icons.question_mark);
}

Text setPlayerName(int index) {
  return Text(
    playerList$.value.length > index
        ? playerList$.value[index].username
        : "Player $index",
    overflow: TextOverflow.ellipsis,
  );
}
