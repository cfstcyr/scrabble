import 'package:flutter/material.dart';
import 'package:mobile/components/scaffold-persistance.dart';

import '../components/invalid-connection-popup.dart';
import '../constants/login-constants.dart';
import '../controllers/account-authentification-controller.dart';
import '../controllers/game-creation-controller.dart';
import '../locator.dart';
import '../main.dart';
import 'create-lobby.dart';

class HomePage extends StatelessWidget {
  @override
  final AccountAuthenticationController authService =
      getIt.get<AccountAuthenticationController>();

  final gameCreationController = getIt.get<GameCreationController>();
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
                  onPressed: () async {
                    await gameCreationController.handleCreateGame();
                    if (context.mounted) {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => CreateLobbyPage()));
                    }
                  },
                  child: Text('Créer une partie'),
                ),
                ElevatedButton(
                  onPressed: () {
                    getIt.get<GameCreationController>().handleStartGame('1');
                    // Navigator.push(context,
                    //     MaterialPageRoute(builder: (context) => GroupPage()));
                  },
                  child: Text('Rejoindre une partie'),
                ),
                SizedBox(width: 10),
                ElevatedButton(
                  onPressed: () {
                    authService.signOut();
                    Navigator.push(context,
                        MaterialPageRoute(builder: (context) => MainPage()));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shadowColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(3.0),
                    ),
                  ),
                  child: Text(SIGNOUT_LABEL_FR,
                      style: TextStyle(color: Colors.white, fontSize: 15)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  handleBackButton(BuildContext context) {
    showDialog<String>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: Text(CONFIRMATION_BACK_BUTTON_DIALOG_TITLE),
        content: const Text(BACK_BUTTON_SIGNOUT_CONFIRMATION_FR),
        actions: <Widget>[
          TextButton(
            onPressed: () => {authService.signOut()},
            child: Row(
              children: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: (context) => HomePage()));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shadowColor: Color.fromARGB(177, 0, 0, 0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(3.0),
                    ),
                  ),
                  child: Text(CANCEL_BACK_BUTTON_FR,
                      style: TextStyle(color: Colors.white, fontSize: 15)),
                ),
                SizedBox(width: 10),
                ElevatedButton(
                  onPressed: () {
                    authService.signOut();
                    Navigator.push(context,
                        MaterialPageRoute(builder: (context) => MainPage()));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shadowColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(3.0),
                    ),
                  ),
                  child: Text(SIGNOUT_CONFIRMATION_LABEL_FR,
                      style: TextStyle(color: Colors.white, fontSize: 15)),
                ),
              ],
            ),
          ),
        ],
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
