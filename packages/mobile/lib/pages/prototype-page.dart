import 'package:flutter/material.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/pages/groups-page.dart';

import '../components/invalid-connection-popup.dart';
import 'create-lobby.dart';

class PrototypePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: "Home",
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            MainTitle(),
            SizedBox(height: 10),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(width: 10), // c'est un spacing fancy
                ElevatedButton(
                  onPressed: () {
                    showInvalidConnectionPopup(context);
                  },
                  child: Text('NeFaitRien'),
                ),
                SizedBox(width: 10), // c'est un spacing fancy

                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => CreateLobbyPage()));
                  },
                  child: Text('Créer une partie'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: (context) => GroupPage()));
                  },
                  child: Text('Rejoindre une partie'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class MainTitle extends StatelessWidget {
  const MainTitle({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var style = theme.textTheme.displayMedium!.copyWith(
      color: theme.colorScheme.onPrimary,
    );
    return Card(
      color: theme.colorScheme.primary,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Text('Bravo, vous êtes connectés!', style: style),
      ),
    );
  }
}
