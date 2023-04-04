import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis-overview.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/classes/puzzle/puzzle-overview.dart';
import 'package:mobile/classes/puzzle/puzzle-result.dart';
import 'package:mobile/components/analysis/analysis-overview-widget.dart';
import 'package:mobile/components/analysis/critical-moment-widget.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/carousel/full-screen-carousel-dialog.dart';
import 'package:mobile/components/puzzle/puzzle-overview.dart';
import 'package:mobile/components/puzzle/puzzle-solution.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/puzzle-service.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:rxdart/rxdart.dart';

class PuzzleResultDialog {
  final PuzzlePlayed puzzlePlayed;
  final List<PuzzleSolution> _puzzleSolutions;

  PuzzleResultDialog({required this.puzzlePlayed})
      : _puzzleSolutions = List.empty();

  void openAnalysisResultDialog(BuildContext context) {
    FullScreenCarouselDialog(
        title: 'Résultat du Puzzle ${puzzlePlayed.levelName.displayName}',
        actionButtons: [
          AppButton(
            onPressed: () => _quitPuzzle(context),
            text: "Retour à l'accueil",
            theme: AppButtonTheme.secondary,
            size: AppButtonSize.normal,
          ),
          SizedBox(
            width: SPACE_2,
          ),
          AppButton(
            onPressed: () => _startNextPuzzle(context),
            text: "Prochain puzzle",
            theme: AppButtonTheme.primary,
            size: AppButtonSize.normal,
          )
        ],
        slides: [
          PuzzleOverviewWidget(
              overview: PuzzleOverview.fromPuzzlePlayed(puzzlePlayed)),
          ..._puzzleSolutions
        ]).openDialog(context);
  }

  void _startNextPuzzle(BuildContext context) {
    Navigator.pop(context);
    getIt.get<PuzzleService>().startPuzzle(
        PUZZLE_LEVELS[puzzlePlayed.levelName] ?? advancedPuzzleLevel);
  }

  void _quitPuzzle(BuildContext context) {
    Navigator.popUntil(
        context,
        (predicate) =>
            predicate.settings.name == HOME_ROUTE ||
            predicate.settings.name == BASE_ROUTE);
  }
}
