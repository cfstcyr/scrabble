import 'package:flutter/material.dart';
import 'package:mobile/constants/invalid-connection-popup.dart';

import '../pages/login-page.dart';

void showInvalidConnectionPopup(BuildContext context) {
  showDialog<String>(
    barrierDismissible: false,
    context: context,
    builder: (BuildContext context) => AlertDialog(
      title: const Text(INVALID_CONNECTION_TITLE_FR),
      content: const Text(INVALID_CONNECTION_BODY_FR),
      actions: <Widget>[
        TextButton(
          onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => LoginPage()));
          },
          child: const Text(INVALID_CONNECTION_BUTTON_FR),
        ),
      ],
    ),
  );
}
