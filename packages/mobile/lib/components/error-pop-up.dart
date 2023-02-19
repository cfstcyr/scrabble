import 'package:flutter/material.dart';

import '../constants/create-lobby-constants.dart';

class ErrorPopup extends StatelessWidget {
  final String errorMessage;

  ErrorPopup({this.errorMessage = DEFAULT_ERROR});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(ERROR_HEADER),
      content: Text(errorMessage),
      actions: [
        TextButton(
          child: Text('OK'),
          onPressed: () => Navigator.pop(context),
        ),
      ],
    );
  }
}
