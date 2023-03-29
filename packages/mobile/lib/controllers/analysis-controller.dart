import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/actions/action-place.dart';
import 'package:mobile/classes/actions/word-placement.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/classes/opponent.dart';
import 'package:mobile/classes/puzzle/puzzle-config.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/constants/socket-events/group-events.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/view-methods/create-lobby-methods.dart';
import 'package:mobile/view-methods/group.methods.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/game/game-config.dart';
import '../classes/group.dart';
import '../constants/socket-events/game-events.dart';
import '../locator.dart';
import '../services/client.dart';
import '../services/socket.service.dart';

class AnalysisController {
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();

  InterceptedHttp get http => httpClient.http;

  final String endpoint = ANALYSIS_ENDPOINT;

  AnalysisController._privateConstructor();

  Future<AnalysisCompleted> requestAnalysis(
      int idAnalysis, AnalysisRequestInfoType requestType) async {
    return http
        .get(Uri.parse("$endpoint/$idAnalysis"),
            params: requestTypeParams(requestType))
        .then((Response value) =>
            AnalysisCompleted.fromJson(jsonDecode(value.body)))
        .timeout(Duration(seconds: 5), onTimeout: () {
      print('timeout');
      return AnalysisCompleted(
          idGameHistory: 1, idUser: 1, criticalMoments: []);
    });
  }

  Future<Response> completePuzzle(WordPlacement placement) async {
    return http.post(Uri.parse("$endpoint/complete"),
        body: jsonEncode(placement));
  }

  Future<Response> abandonPuzzle() async {
    return http.post(Uri.parse("$endpoint/abandon"));
  }

  void quitPuzzle() {
    http.post(Uri.parse("$endpoint/abandon"));
  }

  static final AnalysisController _instance =
      AnalysisController._privateConstructor();

  factory AnalysisController() {
    return _instance;
  }
}
