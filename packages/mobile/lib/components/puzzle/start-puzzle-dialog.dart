import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/create-game/timer-selector.dart';
import 'package:mobile/components/error-pop-up.dart';
import 'package:mobile/components/puzzle/puzzle-level-selector.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/puzzle-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/puzzle-service.dart';

void showStartPuzzleDialog(BuildContext context) {
  showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        ThemeData theme = Theme.of(context);
        final PuzzleLevelSelector puzzleLevelSelector = PuzzleLevelSelector();

        return AlertDialog(
          title: Center(
            child: Text(PUZZLE_PAGE_TITLE,
                style: theme.textTheme.displayMedium
                    ?.copyWith(fontWeight: FontWeight.w500)),
          ),
          content: SingleChildScrollView(child: Center(child: puzzleLevelSelector)),
          contentPadding:
              EdgeInsets.symmetric(vertical: 48.0, horizontal: 32.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8.0)),
          ),
          surfaceTintColor: Colors.white,
          backgroundColor: Colors.white,
          actions: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                ConstrainedBox(
                  constraints: BoxConstraints.tightFor(width: 216, height: 60),
                  child: AppButton(
                    onPressed: () => Navigator.pop(context),
                    theme: AppButtonTheme.secondary,
                    child: Text(
                      CANCEL_BUTTON,
                      style: TextStyle(
                          fontSize: 24, overflow: TextOverflow.ellipsis),
                      textAlign: TextAlign.end,
                    ),
                  ),
                ),
                SizedBox(
                  width: SPACE_3 * 4,
                ),
                ConstrainedBox(
                  constraints: BoxConstraints.tightFor(width: 216, height: 60),
                  child: AppButton(
                    onPressed: () {
                      getIt
                          .get<PuzzleService>()
                          .startPuzzle(puzzleLevelSelector
                                  .puzzleLevel$.valueOrNull?.roundDuration ??
                              advancedPuzzleLevel.roundDuration)
                          .then((bool isSuccess) {
                        Navigator.pop(context);
                        if (isSuccess) {
                          // start puzzle and it will push
                          getIt.get<GameMessagesService>().resetMessages();
                          Navigator.pushReplacementNamed(context, PUZZLE_ROUTE);
                        } else {
                          errorSnackBar(context, START_ERROR);
                        }
                      });
                    },
                    theme: AppButtonTheme.primary,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(START_BUTTON,
                            style: TextStyle(
                                fontSize: 24,
                                color: Colors.white,
                                overflow: TextOverflow.ellipsis),
                            textAlign: TextAlign.end),
                        Icon(
                          Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 48,
                        )
                      ],
                    ),
                  ),
                ),
              ],
            )
          ],
          actionsAlignment: MainAxisAlignment.spaceEvenly,
        );
      });
}