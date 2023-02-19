import 'package:flutter/material.dart';

import '../classes/user.dart';
import '../constants/create-lobby-constants.dart';

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
                        GroupGestion(),
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

class Parameters extends StatelessWidget {
  const Parameters({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 0, right: 0, top: 0, bottom: 40.0),
      child: Container(
          child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: EdgeInsets.only(left: 0, right: 25.0, top: 0, bottom: 0),
            child: ElevatedButton.icon(
                onPressed: () {
                  //TODO quand backend done
                },
                style: setStyleRoomButtons(),
                icon: Icon(Icons.timer),
                // TODO remove:: pas en cst car ne va plus exister quand on recoit info from backend
                label: Text('1:00')),
          ),
          ElevatedButton.icon(
              onPressed: () {
                //TODO quand backend done
              },
              style: setStyleRoomButtons(),
              icon: Icon(Icons.precision_manufacturing_outlined),
              label: Text('Expert'))
        ],
      )),
    );
  }
}

class GroupGestion extends StatelessWidget {
  const GroupGestion({
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
                //TODO AJUSTER TEMPS
              },
              style: setStyleActionButtons(),
              icon: Icon(Icons.keyboard_arrow_left_sharp),
              label: Text(STOP_GAME_SETUP)),
          ElevatedButton.icon(
              onPressed: () {
                //TODO AJUSTER TEMPS
              },
              style: setStyleActionButtons(),
              icon: Icon(Icons.start),
              label: Text(START_GAME))
        ],
      )),
    );
  }
}

class PlayerWaitingList extends StatelessWidget {
  const PlayerWaitingList({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var style = theme.textTheme.displayMedium!.copyWith(
      color: theme.colorScheme.onPrimary,
    );
    return Padding(
      padding: EdgeInsets.only(left: 30.0, right: 0, top: 0, bottom: 0),
      child: Container(
        decoration: BoxDecoration(
            border: Border.all(
              color: Colors.black,
            ),
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.all(Radius.circular(5.0))),
        child: ListView.builder(
          itemCount: playerWaitingList.length,
          itemBuilder: (_, int index) {
            return Padding(
              padding: EdgeInsets.only(
                  left: 15.0, right: 15.0, top: 5.0, bottom: 5.0),
              child: Container(
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(Radius.circular(10.0))),
                child: Row(
                  children: <Widget>[
                    Padding(
                      padding: EdgeInsets.only(
                          left: 15.0, right: 0, top: 10.0, bottom: 10.0),
                      child: setPlayerIcon(index),
                    ),
                    Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(
                            left: 15.0, right: 5.0, top: 0, bottom: 0),
                        child: Text(playerWaitingList[index].username),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.only(
                          left: 5.0, right: 5.0, top: 0, bottom: 0),
                      child: Container(
                        child: IconButton(
                          onPressed: () {
                            addPlayerToLobby(playerWaitingList[index]);
                          },
                          icon: Icon(Icons.check),
                          style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey.shade200,
                              foregroundColor: Colors.green.shade900,
                              shape: CircleBorder()),
                        ),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.only(
                          left: 5.0, right: 15.0, top: 0, bottom: 0),
                      child: IconButton(
                        onPressed: () {
                          refusePlayer(playerWaitingList[index]);
                        },
                        icon: Icon(Icons.clear_outlined),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey.shade200,
                            foregroundColor: Colors.black,
                            shape: CircleBorder()),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class WaitingRoom extends StatelessWidget {
  const WaitingRoom({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var style = theme.textTheme.displayMedium!.copyWith(
      color: theme.colorScheme.onPrimary,
    );
    // TODO : ICON DIFFERENT QUAND TA UN JOUEUR VS NON

    return Padding(
      padding: EdgeInsets.only(left: 0, right: 0, top: 50.0, bottom: 50.0),
      child: Container(
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  SizedBox(
                    height: 50,
                    width: 125,
                    child: ElevatedButton.icon(
                        onPressed: () {},
                        style: setStyleRoomButtons(),
                        icon: setPlayerIcon(0),
                        label: Text(setPlayerName(0))),
                  ),
                  SizedBox(
                    height: 50,
                    width: 125,
                    child: ElevatedButton.icon(
                        onPressed: () {},
                        style: setStyleRoomButtons(),
                        icon: setPlayerIcon(1),
                        label: Text(setPlayerName(1))),
                  ),
                ],
              ),
              Text("vs", style: TextStyle(fontWeight: FontWeight.bold)),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  SizedBox(
                    height: 50,
                    width: 125,
                    child: ElevatedButton.icon(
                        onPressed: () {},
                        style: setStyleRoomButtons(),
                        icon: setPlayerIcon(2),
                        label: Text(setPlayerName(2))),
                  ),
                  SizedBox(
                    height: 50,
                    width: 125,
                    child: ElevatedButton.icon(
                        onPressed: () {},
                        style: setStyleRoomButtons(),
                        icon: setPlayerIcon(3),
                        label: Text(setPlayerName(3))),
                  ),
                ],
              ),
            ],
          )),
    );
  }
}

List<PublicUser> playerWaitingList = [
// TODO : requete joueurs lobby
  PublicUser(username: "michel"),
  PublicUser(username: "ppman"),
  PublicUser(username: "ppman1"),
  PublicUser(username: "ppman2"),
  PublicUser(username: "ppman3"),
  PublicUser(username: "ppman4"),
];

List<PublicUser> playerList = [
// TODO : requete joueurs lobby
  PublicUser(username: "michel"),
];

Widget setPlayerIcon(int index) {
  return playerList.length > index
      ? setAvatar(playerList[index].avatar)
      : Icon(Icons.question_mark);
}

void addPlayerToLobby(PublicUser player) {
  // TODO COTE SERVEUR req
  if (playerList.length > 4) playerWaitingList.remove(player);
  playerList.add(player);
}

void refusePlayer(PublicUser player) {
  // TODO COTE SERVEUR req
  playerWaitingList.remove(player);
}

String setPlayerName(int index) {
  return playerList.length > index
      ? playerList[index].username
      : "Player $index";
}

ButtonStyle setStyleActionButtons() {
  return ElevatedButton.styleFrom(
      backgroundColor: Colors.green.shade900,
      foregroundColor: Colors.white,
      shape: BeveledRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(2))));
}

ButtonStyle setStyleWaitingListButtons() {
  return ElevatedButton.styleFrom(
      foregroundColor: Colors.black, shape: CircleBorder());
}

ButtonStyle setStyleRoomButtons() {
  return ElevatedButton.styleFrom(
    backgroundColor: Colors.grey.shade200,
    foregroundColor: Colors.green.shade900,
  );
}

CircleAvatar setAvatar(String path) {
  return CircleAvatar(
      backgroundColor: Colors.transparent,
      child: SizedBox(
          child: ClipOval(
        child: Image.asset(
          path, //TODO IMAGES PAS POSSIBLE COTE SERVEUR BCS ON DOIT LES RAJOUTER 1 PAR 1 DANS LE pubspec.yaml
        ),
      )));
}
