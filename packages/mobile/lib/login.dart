import 'package:english_words/english_words.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // TODO: login widget
    return ListView(
      children: [
        Text('TODO: login widget'),
        TextFormField(
          cursorColor: Color(0xFF6200EE),
          //  cursorColor: Theme.of(context).cursorColor,Color(0xFF6200EE)
          initialValue: 'Input text',
          maxLength: 20,
          decoration: InputDecoration(
            icon: Icon(Icons.favorite),
            labelText: 'Label text',
            labelStyle: TextStyle(
              color: Color(0xFF6200EE),
            ),
            helperText: 'Helper text',
            suffixIcon: Icon(
              Icons.check_circle,
            ),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: Color(0xFF6200EE)),
            ),
          ),
        ),
        // TODO: input widgets
      ],
    );
  }
}
