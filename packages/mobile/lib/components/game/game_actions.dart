import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/game-constants.dart';
import 'package:mobile/controllers/gameplay-controller.dart';
import 'package:mobile/pages/home-page.dart';

import '../../locator.dart';
import '../alert-dialog.dart';

class GameActions extends StatelessWidget {

  void surrender(BuildContext context) {
    triggerDialogBox(DIALOG_SURRENDER_TITLE, DIALOG_SURRENDER_CONTENT, [
      DialogBoxButtonParameters(
          content: DIALOG_ABANDON_BUTTON_CONFIRM, theme: AppButtonTheme.danger, onPressed: () {
            getIt.get<GameplayController>().leaveGame();
            Navigator.of(context)
                .pushReplacement(
                MaterialPageRoute(builder: (context) => HomePage()));
      }),
      DialogBoxButtonParameters(content: DIALOG_ABANDON_BUTTON_CONTINUE, theme: AppButtonTheme.transparent, closesDialog: true)
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        height: 70,
        padding: EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            AppButton(
              onPressed: () => surrender(context),
              icon: Icons.flag,
              size: AppButtonSize.large,
              theme: AppButtonTheme.danger,
            ),
            AppButton(
              onPressed: () {},
              icon: Icons.lightbulb,
              size: AppButtonSize.large,
            ),
            AppButton(
              onPressed: () {},
              icon: Icons.swap_horiz_rounded,
              size: AppButtonSize.large,
            ),
            AppButton(
              onPressed: () {},
              icon: Icons.skip_next_rounded,
              size: AppButtonSize.large,
            )
          ],
        ),
      ),
    );
  }
}
