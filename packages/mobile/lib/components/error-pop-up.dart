import 'package:flutter/material.dart';

class ErrorPopup extends StatelessWidget {
  final String errorMessage;

  ErrorPopup({this.errorMessage = 'Erreur'});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Error'),
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
