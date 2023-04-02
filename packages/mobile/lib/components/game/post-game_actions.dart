import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/analysis/analysis-result-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/analysis-service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/player-leave-service.dart';

class PostGameActions extends StatelessWidget {
  final AnalysisService _analysisService = getIt.get<AnalysisService>();
  final GameService _gameService = getIt.get<GameService>();
  AnalysisCompleted? analysis;

  void leave(BuildContext context) {
    getIt.get<PlayerLeaveService>().leaveGame(context);
  }

  void requestAnalysis(BuildContext context) async {
    if (analysis != null) {
      AnalysisResultDialog(criticalMoments: analysis!.criticalMoments)
          .openAnalysisResultDialog(context);
      return;
    }

    analysis = await _analysisService.requestAnalysis(
        _gameService.game.idGameHistory ?? -1, AnalysisRequestInfoType.idGame);
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
                onPressed: () => leave(context),
                icon: Icons.output_outlined,
                size: AppButtonSize.large,
                theme: AppButtonTheme.danger,
              ),
              AppButton(
                onPressed: () => requestAnalysis(context),
                icon: Icons.science,
                size: AppButtonSize.large,
                theme: AppButtonTheme.primary,
              ),
            ],
          )),
    );
  }
}
