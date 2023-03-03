import 'package:flutter/material.dart';
import 'package:mobile/components/chatbox.dart';
import 'package:mobile/constants/login-constants.dart';

import '../controllers/account-authentification-controller.dart';
import '../locator.dart';
import '../main.dart';

class HomePage extends StatelessWidget {
  final AccountAuthenticationController authService =
      getIt.get<AccountAuthenticationController>();
  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        handleBackButton();
        return true;
      },
      child: Center(
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
                    Navigator.push(context,
                        MaterialPageRoute(builder: (context) => ChatPage()));
                  },
                  child: Text('Amusez vous à clavarder'),
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
                  child: Text(
                    SIGNOUT_LABEL_FR,
                  ),
                ),
                SizedBox(width: 10),
              ],
            ),
          ],
        ),
      ),
    );
  }

  handleBackButton() {
    authService.signOut();
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
