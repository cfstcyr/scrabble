import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/actions/action-place.dart';
import 'package:mobile/classes/opponent.dart';
import 'package:mobile/classes/puzzle/puzzle-config.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/constants/socket-events/group-events.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/view-methods/create-lobby-methods.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../classes/game/game-config.dart';
import '../classes/group.dart';
import '../constants/socket-events/game-events.dart';
import '../locator.dart';
import '../services/client.dart';
import '../services/socket.service.dart';

class PuzzleController {
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();

  InterceptedHttp get http => httpClient.http;

  final String endpoint = PUZZLE_ENDPOINT;

  PuzzleController._privateConstructor();

  Future<Response> startPuzzle() async {
    return http.post(Uri.parse("$endpoint/start"));
  }

  Future<Response> completePuzzle(ActionPlacePayload placement) async {
    return http.post(Uri.parse("$endpoint/complete"), body: jsonEncode(placement));
  }

  Future<Response> abandonPuzzle() async {
    return http.post(Uri.parse("$endpoint/abandon"));
  }

  void quitPuzzle() {
    http.post(Uri.parse("$endpoint/abandon"));
  }

  static final PuzzleController _instance =
      PuzzleController._privateConstructor();

  factory PuzzleController() {
    return _instance;
  }
}
