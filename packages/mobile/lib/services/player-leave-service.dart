import 'package:flutter/material.dart';
import 'package:mobile/controllers/gameplay-controller.dart';

import '../components/alert-dialog.dart';
import '../components/app_button.dart';
import '../constants/locale/game-constants.dart';
import '../locator.dart';
import '../pages/home-page.dart';
import '../routes/routes.dart';

class PlayerLeaveService {

  GameplayController gameplayController = getIt.get<GameplayController>();

  PlayerLeaveService._privateConstructor();

  static final PlayerLeaveService _instance = PlayerLeaveService._privateConstructor();

  factory PlayerLeaveService() {
    return _instance;
  }

  Future<void> leaveGame(BuildContext context) async {
    triggerDialogBox(DIALOG_SURRENDER_TITLE, DIALOG_SURRENDER_CONTENT, [
      DialogBoxButtonParameters(
          content: DIALOG_ABANDON_BUTTON_CONFIRM, theme: AppButtonTheme.tomato, onPressed: () async {
        await getIt.get<GameplayController>().leaveGame();

        if (!context.mounted) return;
        Navigator.popUntil(context, ModalRoute.withName(HOME_ROUTE));
      }),
      DialogBoxButtonParameters(content: DIALOG_ABANDON_BUTTON_CONTINUE, theme: AppButtonTheme.secondary, closesDialog: true)
    ]);
  }
}
