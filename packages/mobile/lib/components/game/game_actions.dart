import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';

class GameActions extends StatelessWidget {
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
              onPressed: () {},
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
