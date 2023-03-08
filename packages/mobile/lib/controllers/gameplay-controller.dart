import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/actions/action-data.dart';
import '../constants/endpoint.constants.dart';
import '../locator.dart';
import '../services/client.dart';
import '../services/socket.service.dart';

class GameplayController {
  final String baseEndpoint = GAME_ENDPOINT;
  String? currentGameId;
  final Subject<void> _actionDone$ = PublishSubject();

  Stream<void> get actionDoneEvent => _actionDone$.stream;

  SocketService socketService = getIt.get<SocketService>();

  GameplayController._privateConstructor();

  static final GameplayController _instance =
      GameplayController._privateConstructor();

  factory GameplayController() {
    return _instance;
  }
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();
  InterceptedHttp get http => httpClient.http;

  Future<void> sendAction(ActionData actionData) async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/action");
    http.post(endpoint, body: actionData).then((_) => _actionDone$.add(null));
  }

  Future<void> leaveGame() async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/leave");
    await http.delete(endpoint);
  }
}
