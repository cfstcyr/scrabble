import 'package:flutter/material.dart';

import '../routes/navigator-key.dart';

class DialogBoxButtonParameters {
  final String content;
  final bool? closesDialog;
  final Function? onPressed;
  final IconData? icon;

  DialogBoxButtonParameters(
      {required this.content, this.closesDialog, this.onPressed, this.icon});
}

void triggerDialogBox(String title, String message, List<DialogBoxButtonParameters> buttons) {
  showDialog<void>(
    context: navigatorKey.currentContext!,
    barrierDismissible: false,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text(title),
        surfaceTintColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        content: SingleChildScrollView(
          child: ListBody(
            children: <Widget>[
              Text(message, style: TextStyle(fontSize: 16)),
            ],
          ),
        ),
        actions: <Widget>[
          TextButton(
            child: const Text('Ok'),
            onPressed: () => onPressed(),
          ),
        ],
      );
    },
  );
}
