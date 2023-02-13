import 'package:flutter/material.dart';

import '../classes/player.dart';

class CreateLobbyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FractionallySizedBox(
        widthFactor: 1,
        heightFactor: 1,
        child: FractionallySizedBox(
          widthFactor: 0.5,
          heightFactor: 0.4,
          child: Container(
            decoration: BoxDecoration(
                border: Border.all(
                  color: Colors.green,
                ),
                borderRadius: BorderRadius.all(Radius.circular(20))),
            alignment: Alignment.center,
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  Expanded(
                    child: SizedBox(height: 5.0, child: PlayerCase()),
                  ),
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
    );
  }
}

class Parameters extends StatelessWidget {
  const Parameters({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
        decoration: BoxDecoration(
            border: Border.all(
              color: Colors.green,
            ),
            borderRadius: BorderRadius.all(Radius.circular(20))),
        child: Column(
          children: [
            Center(
                child: Text(
                    "Parametres")), // TODO: ENLEVER CENTER ENLEVE LESPACE AUTOUR DE PARAMETRES
            ElevatedButton.icon(
                onPressed: () {
                  //TODO AJUSTER TEMPS
                },
                icon: Icon(Icons.timer),
                label: Text('1:00'))
          ],
        ));
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
              icon: Icon(Icons.keyboard_arrow_left_sharp),
              label: Text('Annuler la partie')),
          ElevatedButton.icon(
              onPressed: () {
                //TODO AJUSTER TEMPS
              },
              icon: Icon(Icons.start),
              label: Text('Démarrer la partie'))
        ],
      )),
    );
  }
}

class PlayerCase extends StatelessWidget {
  const PlayerCase({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var style = theme.textTheme.displayMedium!.copyWith(
      color: theme.colorScheme.onPrimary,
    );
    return Container(
      decoration: BoxDecoration(
          border: Border.all(
            color: Colors.green,
          ),
          borderRadius: BorderRadius.all(Radius.circular(20))),
      child: ListView(
        children: List.generate(
          playerList.length,
          (index) => Row(
            children: <Widget>[
              Expanded(
                child: Padding(
                  padding:
                      EdgeInsets.only(left: 5.0, right: 5.0, top: 0, bottom: 0),
                  child: Text(playerList[index].username),
                ),
              ),
              Padding(
                padding:
                    EdgeInsets.only(left: 5.0, right: 5.0, top: 0, bottom: 0),
                child: ElevatedButton(
                  onPressed: () {
                    //TODO
                  },
                  style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade900,
                      foregroundColor: Colors.white,
                      shape: BeveledRectangleBorder(
                          borderRadius: BorderRadius.all(Radius.circular(2)))),
                  child: Text('Accepter'),
                ),
              ),
              Padding(
                padding:
                    EdgeInsets.only(left: 5.0, right: 5.0, top: 0, bottom: 0),
                child: ElevatedButton(
                  onPressed: () {
                    //TODO
                  },
                  style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade900,
                      foregroundColor: Colors.white,
                      shape: BeveledRectangleBorder(
                          borderRadius: BorderRadius.all(Radius.circular(2)))),
                  child: Text('Refuser'),
                ),
              ),
            ],
          ),
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

    return Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(
            border: Border.all(
              color: Colors.green,
            ),
            borderRadius: BorderRadius.all(Radius.circular(20))),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding:
                      EdgeInsets.only(left: 5.0, right: 5.0, top: 0, bottom: 0),
                  child: ElevatedButton.icon(
                      onPressed: () {},
                      icon: Icon(setPlayerIcon(0)),
                      label: Text(setPlayerName(0))),
                ),
                ElevatedButton.icon(
                    onPressed: () {},
                    icon: Icon(setPlayerIcon(1)),
                    label: Text(setPlayerName(1))),
              ],
            ),
            Text("vs"),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                    padding: EdgeInsets.only(
                        left: 5.0, right: 5.0, top: 0, bottom: 0),
                    child: ElevatedButton.icon(
                        onPressed: () {},
                        icon: Icon(setPlayerIcon(2)),
                        label: Text(setPlayerName(2)))),
                ElevatedButton.icon(
                    onPressed: () {},
                    icon: Icon(setPlayerIcon(3)),
                    label: Text(setPlayerName(3))),
              ],
            ),
            ElevatedButton.icon(
                onPressed: () {
                  // TODO: a voir comment on veux ca
                },
                icon: Icon(Icons.filter_list_alt),
                label: Text('Remplir les vides')),
          ],
        ));
  }
}

List<PlayerView> playerWaitingList = [
// TODO : requete joueurs lobby
  PlayerView(username: "michel"),
  PlayerView(username: "ppman"),
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
