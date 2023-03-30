import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/controllers/analysis-controller.dart';
import 'package:mobile/locator.dart';

class AnalysisService {
  final AnalysisController _analysisController =
      getIt.get<AnalysisController>();

  AnalysisService._privateConstructor();

  Future<AnalysisCompleted> requestAnalysis(int idAnalysis, AnalysisRequestInfoType requestType) {
    return _analysisController.requestAnalysis(idAnalysis, requestType);
  }

  static final AnalysisService _instance =
  AnalysisService._privateConstructor();

  factory AnalysisService() {
    return _instance;
  }
}
