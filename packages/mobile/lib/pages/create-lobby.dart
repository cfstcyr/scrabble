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
          heightFactor: 0.5,
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
              label: Text('Quitter le groupe')),
          ElevatedButton.icon(
              onPressed: () {
                //TODO AJUSTER TEMPS
              },
              icon: Icon(Icons.start),
              label: Text('Commencer la partie'))
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
                child: Text(playerList[index].username),
              ),
              ElevatedButton(
                onPressed: () {
                  //TODO
                },
                child: Text('Accepter'),
              ),
              ElevatedButton(
                onPressed: () {
                  //TODO
                },
                child: Text('Refuser'),
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
    // IconData icon;
    // if (appState.favorites.contains(pair)) {
    //   icon = Icons.favorite;
    // } else {
    //   icon = Icons.favorite_border;
    // }

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
                ElevatedButton.icon(
                    onPressed: () {},
                    icon: Icon(Icons.person),
                    label: Text('Player 1')),
                ElevatedButton.icon(
                    onPressed: () {},
                    icon: Icon(Icons.person),
                    label: Text('Player 1')),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                    onPressed: () {},
                    icon: Icon(Icons.person),
                    label: Text('Player 1')),
                ElevatedButton.icon(
                    onPressed: () {},
                    icon: Icon(Icons.person),
                    label: Text('Player 1')),
              ],
            ),
          ],
        ));
  }
}

List<Player> playerList = [
// TODO : requete joueurs lobby
  Player(username: "michel"),
  Player(username: "ppman"),
];
