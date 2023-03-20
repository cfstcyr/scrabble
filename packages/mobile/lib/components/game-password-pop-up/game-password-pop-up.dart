import 'package:flutter/material.dart';
import 'package:mobile/constants/invalid-connection-popup.dart';
import 'package:mobile/routes/routes.dart';

import '../../constants/join-game.constants.dart';

void showGamePasswordPopup(BuildContext context) {
  showDialog<String>(
    barrierDismissible: false,
    context: context,
    builder: (BuildContext context) => AlertDialog(
      title: const Text(GAME_PASSWORD_LABEL_FR),
      content: const Text(ENTER_PASSWORD_LABEL_FR),
      actions: <Widget>[
        TextButton(
          onPressed: () {
            Navigator.pushNamed(context, LOGIN_ROUTE);
          },
          child: const Text(INVALID_CONNECTION_BUTTON_FR),
        ),
      ],
    ),
  );
}
