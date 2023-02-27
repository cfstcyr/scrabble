import 'package:flutter/material.dart';
import 'package:mobile/components/chatbox.dart';

import '../components/invalid-connection-popup.dart';
import '../locator.dart';
import '../main.dart';
import '../services/authentification-service.dart';

class HomePage extends StatelessWidget {
  final authService = getIt.get<AuthentificationService>();
  @override
  Widget build(BuildContext context) {
    return Center(
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
                  Navigator.push(context,
                      MaterialPageRoute(builder: (context) => ChatPage()));
                },
                child: Text('Amusez vous à clavarder'),
              ),
              SizedBox(width: 10),
              ElevatedButton(
                onPressed: () {
                  authService.signout();
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
                  "Se déconnecter",
                ),
              ),
              SizedBox(width: 10),
            ],
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
