import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart';
import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/opponent.dart';
import 'package:mobile/classes/puzzle/puzzle.dart';
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

class PuzzleCreationController {
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();

  InterceptedHttp get http => httpClient.http;

  final String endpoint = PUZZLE_ENDPOINT;

  PuzzleCreationController._privateConstructor();

  Future<Response> startPuzzle() async {
    return http.post(Uri.parse("$endpoint/start"));
  }

  static final PuzzleCreationController _instance =
      PuzzleCreationController._privateConstructor();

  factory PuzzleCreationController() {
    return _instance;
  }
}
