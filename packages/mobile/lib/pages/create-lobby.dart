import 'package:flutter/material.dart';

import '../classes/player.dart';

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
                  //TODO AJUSTER TEMPS
                },
                style: setStyleRoomButtons(),
                icon: Icon(Icons.timer),
                label: Text('1:00')),
          ),
          ElevatedButton.icon(
              onPressed: () {
                //TODO AJUSTER TEMPS
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
              label: Text('Annuler la partie')),
          ElevatedButton.icon(
              onPressed: () {
                //TODO AJUSTER TEMPS
              },
              style: setStyleActionButtons(),
              icon: Icon(Icons.start),
              label: Text('Démarrer la partie'))
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
                      child: setAvatar("images/avatar-12.png"),
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
                            //TODO
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
                          //TODO
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
                        icon: setAvatar("images/avatar-12.png"),
                        label: Text(setPlayerName(0))),
                  ),
                  SizedBox(
                    height: 50,
                    width: 125,
                    child: ElevatedButton.icon(
                        onPressed: () {},
                        style: setStyleRoomButtons(),
                        icon: setAvatar("images/avatar-12.png"),
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
                        icon: Icon(setPlayerIcon(2)),
                        label: Text(setPlayerName(2))),
                  ),
                  SizedBox(
                    height: 50,
                    width: 125,
                    child: ElevatedButton.icon(
                        onPressed: () {},
                        style: setStyleRoomButtons(),
                        icon: Icon(setPlayerIcon(3)),
                        label: Text(setPlayerName(3))),
                  ),
                ],
              ),
              // ElevatedButton.icon(
              //     onPressed: () {
              //       // TODO: a voir comment on veux ca
              //     },
              //     icon: Icon(Icons.filter_list_alt),
              //     style: setStyleActionButtons(),
              //     label: Text('Remplir les vides')),
            ],
          )),
    );
  }
}

List<PlayerView> playerWaitingList = [
// TODO : requete joueurs lobby
  PlayerView(username: "michel"),
  PlayerView(username: "ppman"),
  PlayerView(username: "ppman1"),
  PlayerView(username: "ppman2"),
  PlayerView(username: "ppman3"),
  PlayerView(username: "ppman4"),
];

List<PlayerView> playerList = [
// TODO : requete joueurs lobby
  PlayerView(username: "michel"),
  PlayerView(username: "ppman"),
];

IconData fillWithVirtualPlayers() {
  //TODO CALL METHODE POUR FILL DE VIRTUAL PLAYERS
  return Icons.precision_manufacturing_outlined;
}

IconData setPlayerIcon(int index) {
  return playerList.length > index
      ? playerList[index].icon
      : Icons.question_mark;
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
