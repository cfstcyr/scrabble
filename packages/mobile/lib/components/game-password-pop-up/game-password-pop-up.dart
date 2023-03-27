import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/routes/routes.dart';

import '../../classes/group.dart';
import '../../classes/text-field-handler.dart';
import '../../classes/user.dart';
import '../../constants/create-account-constants.dart';
import '../../constants/join-game.constants.dart';
import '../../constants/join-group.constants.dart';
import '../../view-methods/group.methods.dart';
import '../alert-dialog.dart';
import '../app_button.dart';

void showGamePasswordPopup(
    BuildContext context, Group group, Function joinGroupFunction) {
  StreamSubscription canceledSubscription;
  StreamSubscription fullGroupSubscription;
  StreamSubscription gameStartedSubscription;
  canceledSubscription = canceledStream.listen((PublicUser host) {
    handleCanceledGame(host, context);
  });
  fullGroupSubscription = fullGroupStream.listen((isFull) {
    handleFullGroup(isFull, context);
  });
  gameStartedSubscription = rejectedStream.listen((PublicUser host) {
    handleGameStarted(host, context);
  });
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
                    Navigator.pop(context);
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
                      Navigator.pop(context);
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

void handleCanceledGame(PublicUser host, context) {
  Navigator.pop(context);
  triggerDialogBox(GAME_CANCELED, "${host.username} a annulé la partie", [
    DialogBoxButtonParameters(
        content: 'OK',
        closesDialog: true,
        theme: AppButtonTheme.primary,
        onPressed: () {
          Navigator.pushReplacementNamed(context, GROUPS_ROUTE);
        })
  ]);
}

void handleFullGroup(bool isFull, context) {
  Navigator.pop(context);
  triggerDialogBox(GAME_STARTED, GAME_STARTED_MESSAGE, [
    DialogBoxButtonParameters(
        closesDialog: true,
        content: 'OK',
        theme: AppButtonTheme.primary,
        onPressed: () {
          Navigator.pop(context);
          Navigator.pushReplacementNamed(context, GROUPS_ROUTE);
        })
  ]);
}

void handleGameStarted(PublicUser host, context) {
  Navigator.pop(context);
  triggerDialogBox(GAME_STARTED, GAME_STARTED_MESSAGE, [
    DialogBoxButtonParameters(
        content: 'OK',
        closesDialog: true,
        theme: AppButtonTheme.primary,
        onPressed: () {
          Navigator.pushReplacementNamed(context, GROUPS_ROUTE);
        }),
  ]);
}
