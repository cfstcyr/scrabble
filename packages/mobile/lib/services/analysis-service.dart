import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:mobile/classes/actions/word-placement.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/puzzle/puzzle-config.dart';
import 'package:mobile/classes/puzzle/puzzle-player.dart';
import 'package:mobile/classes/puzzle/puzzle.dart';
import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/constants/puzzle-constants.dart';
import 'package:mobile/constants/socket-constants.dart';
import 'package:mobile/controllers/analysis-controller.dart';
import 'package:mobile/controllers/puzzle-controller.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:rxdart/rxdart.dart';

import '../locator.dart';

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
