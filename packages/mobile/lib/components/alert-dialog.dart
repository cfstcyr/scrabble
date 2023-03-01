import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';

import '../routes/navigator-key.dart';

class DialogBoxButtonParameters {
  final String content;
  final AppButtonTheme theme;
  final Function()? onPressed;
  final bool? closesDialog;
  final IconData? icon;

  DialogBoxButtonParameters(
      {required this.content,
      required this.theme,
      this.onPressed,
      this.closesDialog,
      this.icon})
      : assert(onPressed != null ? closesDialog == null : closesDialog != null),
        assert(closesDialog != null ? onPressed == null : onPressed != null);
}

void triggerDialogBox(
    String title, String message, List<DialogBoxButtonParameters> buttons) {
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
        actions: buttons
            .map((DialogBoxButtonParameters button) => AppButton(
                  onPressed: button.onPressed ?? () => Navigator.pop(context),
                  theme: button.theme,
                  text: button.content,
                  icon: button.icon,
                ))
            .toList(),
      );
    },
  );
}
