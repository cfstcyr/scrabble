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
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  ElevatedButton(
                      onPressed: () {
                        //TODO
                      },
                      child: Text("Quitter le groupe")),
                  Expanded(
                    child: SizedBox(height: 15.0, child: PlayerCase()),
                  ),
                  Container(
                      decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.green,
                          ),
                          borderRadius: BorderRadius.all(Radius.circular(20))),
                      child: Column(
                        children: [
                          Center(child: Text("Parametres")),
                          ElevatedButton.icon(
                              onPressed: () {
                                //TODO AJUSTER TEMPS
                              },
                              icon: Icon(Icons.timer),
                              label: Text('1:00'))
                        ],
                      )),
                ],
              ),
            ),
          ),
        ),
      ),
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
    return ListView(
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
    );
  }
}

List<Player> playerList = [
// TODO : requete joueurs lobby
  Player(username: "michel"),
  Player(username: "ppman"),
];
