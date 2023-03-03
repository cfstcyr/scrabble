import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/services/player-leave-service.dart';

import '../../locator.dart';

class GameActions extends StatelessWidget {

  void surrender(BuildContext context) {
    getIt.get<PlayerLeaveService>().leaveGame(context);
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
