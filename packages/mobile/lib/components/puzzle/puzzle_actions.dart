import 'package:flutter/material.dart';
import 'package:mobile/classes/puzzle/puzzle.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/puzzle-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/puzzle-service.dart';

class PuzzleActions extends StatelessWidget {
  final PuzzleService _puzzleService = getIt.get<PuzzleService>();
  final GameEventService _gameEventService = getIt.get<GameEventService>();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<PuzzleGame?>(
      stream: _puzzleService.puzzleStream,
      builder: (context, snapshot) {
        return Card(
          child: Container(
              height: 70,
              padding:
                  EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  AppButton(
                    onPressed: () => _quit(context),
                    icon: Icons.output_outlined,
                    size: AppButtonSize.large,
                    theme: AppButtonTheme.danger,
                  ),
                  AppButton(
                    onPressed: () {
                      _gameEventService.add<void>(
                          PUT_BACK_TILES_ON_TILE_RACK, null);
                      _puzzleService.abandonPuzzle();
                    },
                    icon: Icons.not_interested_rounded,
                    size: AppButtonSize.large,
                  ), // Passer
                  StreamBuilder<bool>(
                    stream: snapshot.hasData
                        ? snapshot.data!.board.isValidPlacementStream
                        : Stream.value(false),
                    builder: (context, canPlace) {
                      return AppButton(
                        onPressed: canPlace.data ?? false
                            ? () => _puzzleService.completePuzzle()
                            : null,
                        icon: Icons.play_arrow_rounded,
                        size: AppButtonSize.large,
                      );
                    },
                  ),
                ],
              )),
        );
      },
    );
  }

  void _quit(BuildContext context) {
    triggerDialogBox(DIALOG_QUIT_TITLE, [
      Text(DIALOG_QUIT_CONTENT, style: TextStyle(fontSize: 16))
    ], [
      DialogBoxButtonParameters(
          content: DIALOG_ABANDON_BUTTON_CONFIRM,
          theme: AppButtonTheme.tomato,
          onPressed: () async {
            _puzzleService.quitPuzzle();

            if (!context.mounted) return;
            Navigator.popUntil(
                context,
                (route) =>
                    route.settings.name == HOME_ROUTE ||
                    route.settings.name == BASE_ROUTE);
            Navigator.pushNamed(context, HOME_ROUTE);
          }),
      DialogBoxButtonParameters(
          content: DIALOG_ABANDON_BUTTON_CONTINUE,
          theme: AppButtonTheme.secondary,
          closesDialog: true)
    ]);
  }
}