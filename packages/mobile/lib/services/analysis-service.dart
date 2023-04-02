import 'package:flutter/cupertino.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/analysis/analysis-request-dialog.dart';
import 'package:mobile/components/analysis/analysis-result-dialog.dart';
import 'package:mobile/controllers/analysis-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/navigator-key.dart';

class AnalysisService {
  final AnalysisController _analysisController =
      getIt.get<AnalysisController>();

  AnalysisService._privateConstructor();

  void requestAnalysis(
      int idAnalysis, AnalysisRequestInfoType requestType) async {
    _analysisController
        .requestAnalysis(idAnalysis, requestType)
        .then((AnalysisCompleted analysisCompleted) {
      Navigator.pop(navigatorKey.currentContext!);

      AnalysisResultDialog(criticalMoments: analysisCompleted.criticalMoments)
          .openAnalysisResultDialog(navigatorKey.currentContext!);
    }).catchError((error) {
      Navigator.pop(navigatorKey.currentContext!);

      AnalysisRequestDialog(
              title: 'Analyse introuvable',
              message: "Aucune analyse n'existe pour cette partie",
              isLoading: false)
          .openAnalysisRequestDialog(navigatorKey.currentContext!);
    });
  }

  static final AnalysisService _instance =
      AnalysisService._privateConstructor();

  factory AnalysisService() {
    return _instance;
  }
}
