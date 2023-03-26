import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/routes/routes.dart';

import '../../classes/group.dart';
import '../../classes/text-field-handler.dart';
import '../../classes/user.dart';
import '../../constants/create-account-constants.dart';
import '../../constants/join-game.constants.dart';
import '../../view-methods/group.methods.dart';
import '../alert-dialog.dart';
import '../app_button.dart';

const FULL_GROUP = "Partie pleine";
const FULL_GROUP_MESSAGE = " Veuillez choisir une autre partie";
const INVALID_GAME_PASSWORD = "Mot de passe invalide, Veuillez Réesayer";
const JOIN_GAME_LABEL_FR = "Joindre";
const GO_BACK_GROUPS = "Retourner aux parties";

void showGamePasswordPopup(
    BuildContext context, Group group, Function joinGroupFunction) {
  String _password = "";
  final passwordHandler = TextFieldHandler();
  late StreamSubscription canceledSubscription;
  canceledSubscription = canceledStream.listen((PublicUser host) {
    triggerDialogBox("Partie annulée", "${host.username} a annulé la partie", [
      DialogBoxButtonParameters(
          content: 'OK',
          theme: AppButtonTheme.primary,
          onPressed: () {
            Navigator.pushReplacementNamed(context, GROUPS_ROUTE);
          })
    ]);
  });
  late StreamSubscription fullGroupSubscription;
  fullGroupSubscription = fullGroupStream.listen((isFull) {
    triggerDialogBox(FULL_GROUP, FULL_GROUP_MESSAGE, [
      DialogBoxButtonParameters(
          content: 'OK',
          theme: AppButtonTheme.primary,
          onPressed: () {
            Navigator.pushReplacementNamed(context, GROUPS_ROUTE);
          })
    ]);
  });

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
              actions: <Widget>[
                AppButton(
                  onPressed: () {
                    Navigator.pushNamed(context, GROUPS_ROUTE);
                  },
                  child: Wrap(children: [
                    Icon(Icons.arrow_back, color: Colors.white),
                    const Text(GO_BACK_GROUPS,
                        style: TextStyle(color: Colors.white, fontSize: 18))
                  ]),
                  size: AppButtonSize.large,
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
