import 'package:flutter/material.dart';
import 'package:mobile/routes/routes.dart';

import '../../classes/group.dart';
import '../../classes/text-field-handler.dart';
import '../../constants/create-account-constants.dart';
import '../../constants/join-game.constants.dart';

void showGamePasswordPopup(
    BuildContext context, Group group, Function joinGroupFunction) {
  String _password = "";
  final passwordHandler = TextFieldHandler();

  showDialog<String>(
    barrierDismissible: false,
    context: context,
    builder: (BuildContext context) => AlertDialog(
      title: const Text(GAME_PASSWORD_LABEL_FR),
      content: TextField(
        controller: passwordHandler.controller,
        focusNode: passwordHandler.focusNode,
        keyboardType: TextInputType.visiblePassword,
        autocorrect: false,
        enableSuggestions: false,
        decoration: InputDecoration(
          border: OutlineInputBorder(),
          labelText: PASSWORD_LABEL_FR,
          errorText: passwordHandler.errorMessage.isEmpty
              ? null
              : passwordHandler.errorMessage,
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () {
            Navigator.pushNamed(context, GROUPS_ROUTE);
          },
          child: const Text("Revenir à la page Join"),
        ),
        TextButton(
          onPressed: () async {
            await joinGroupFunction(
                group.groupId, passwordHandler.controller.text, false);
            Navigator.pushNamed(context, JOIN_LOBBY_ROUTE, arguments: group);
          },
          child: const Text("Rejoindre"),
        ),
      ],
    ),
  );
}
