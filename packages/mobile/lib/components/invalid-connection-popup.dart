import 'package:flutter/material.dart';

import '../pages/login-page.dart';

void showInvalidConnectionPopup(BuildContext context) {
  showDialog<String>(
    barrierDismissible: false,
    context: context,
    builder: (BuildContext context) => AlertDialog(
      title: const Text("Connexion Invalide"),
      content: const Text("Vous n'êtes pas connecté à un compte ou un autre appareil est présentement connecté sur ce compte."),
      actions: <Widget>[
        TextButton(
          onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => LoginPage()));
          },
          child: const Text("Retourner à la page de connexion"),
        ),
      ],
    ),
  );
}
