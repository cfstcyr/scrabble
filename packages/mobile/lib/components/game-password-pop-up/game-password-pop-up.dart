import 'package:flutter/material.dart';
import 'package:mobile/routes/routes.dart';

import '../../classes/group.dart';
import '../../classes/text-field-handler.dart';
import '../../constants/create-account-constants.dart';
import '../../constants/join-game.constants.dart';
import '../../constants/join-group.constants.dart';
import '../app_button.dart';

void showGamePasswordPopup(
    BuildContext context, Group group, Function joinGroupFunction) {
  String _password = "";
  final passwordHandler = TextFieldHandler();
  showDialog<String>(
      barrierDismissible: false,
      context: context,
      builder: (BuildContext context) =>
          StatefulBuilder(builder: (context, StateSetter setState) {
            return AlertDialog(
              title: const Text(GAME_PASSWORD_LABEL_FR),
              content: TextField(
                controller: passwordHandler.controller,
                focusNode: passwordHandler.focusNode,
                keyboardType: TextInputType.visiblePassword,
                autocorrect: false,
                enableSuggestions: false,
                decoration: InputDecoration(
                  prefixIcon: Icon(Icons.lock),
                  border: OutlineInputBorder(),
                  labelText: PASSWORD_LABEL_FR,
                  errorText: passwordHandler.errorMessage.isEmpty
                      ? null
                      : passwordHandler.errorMessage,
                ),
              ),
              surfaceTintColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              actions: <Widget>[
                AppButton(
                  onPressed: () {
                    Navigator.pushNamed(context, GROUPS_ROUTE);
                  },
                  child: Wrap(children: [
                    Icon(Icons.arrow_back),
                    const Text(GO_BACK_GROUPS, style: TextStyle(fontSize: 18))
                  ]),
                  size: AppButtonSize.large,
                  theme: AppButtonTheme.secondary,
                ),
                SizedBox(width: 30),
                AppButton(
                  onPressed: () async {
                    bool isValid = await joinGroupFunction(
                        group.groupId, passwordHandler.controller.text, false);
                    if (isValid) {
                      Navigator.pushNamed(context, JOIN_LOBBY_ROUTE,
                          arguments: group);
                    } else {
                      setState(() {
                        passwordHandler.errorMessage = INVALID_GAME_PASSWORD;
                      });
                    }
                  },
                  child: Wrap(children: [
                    const Text(JOIN_GAME_LABEL_FR,
                        style: TextStyle(color: Colors.white, fontSize: 18)),
                    Icon(
                      Icons.play_arrow_outlined,
                      color: Colors.white,
                    ),
                  ]),
                  size: AppButtonSize.large,
                ),
              ],
              backgroundColor: Colors.white,
            );
          }));
}
