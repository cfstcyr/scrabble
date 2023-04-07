import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';

class DailyPuzzleDialogContent extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text('Classement du puzzle quotidien', style: theme.textTheme.displaySmall!.copyWith(fontWeight: FontWeight.w500)),
        SizedBox(height: SPACE_1,),
        Opacity(opacity: 0.64, child: Text(DateTime.now().toString(), style: theme.textTheme.titleMedium,)),

      ],
    );
  }

}
