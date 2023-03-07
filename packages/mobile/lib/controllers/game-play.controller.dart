import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:rxdart/rxdart.dart';
import 'package:mobile/classes/message/message.dart';
import 'package:mobile/classes/game/game-update.dart';
import 'package:mobile/classes/actions/action-data.dart';

import 'package:http/http.dart';

class GamePlayController {
  GamePlayController._privateConstructor() {
    configureSocket();
  }

  static final GamePlayController _instance =
      GamePlayController._privateConstructor();

  factory GamePlayController() {
    return _instance;
  }

  SocketService socketService = getIt.get<SocketService>();

  final String baseEndpoint = GAME_ENDPOINT;

  String? currentGameId;

  final Subject<void> _actionDone$ = PublishSubject();

  Stream<void> get actionDoneEvent => _actionDone$.stream;

  final BehaviorSubject<GameUpdateData> gameUpdate$ =
      BehaviorSubject<GameUpdateData>();
  final BehaviorSubject<Message?> newMessage$ =
      BehaviorSubject<Message?>.seeded(null);
  final PublishSubject<void> actionDone$ = PublishSubject<void>();

  Future<void> sendAction(ActionData actionData) async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/action");
    post(endpoint, body: actionData).then((_) => _actionDone$.add(null));
  }

  Future<void> leaveGame() async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/leave");
    await delete(endpoint);
  }

  // void sendMessage(String gameId, Message message) {
  //   Uri endpoint = Uri.parse("$endpoint/$gameId/message");
  //   _httpClient
  //       .post(Uri.parse(endpoint), body: jsonEncode(message))
  //       .then((response) {});
  // }

  // void sendError(String gameId, Message message) {
  //   final endpoint = '${environment.serverUrl}/games/$gameId/players/error';
  //   _httpClient
  //       .post(Uri.parse(endpoint), body: jsonEncode(message))
  //       .then((response) {});
  // }

  // void handleReconnection(String gameId, String newPlayerId) {
  //   final endpoint = '${environment.serverUrl}/games/$gameId/players/reconnect';
  //   _httpClient
  //       .post(Uri.parse(endpoint),
  //           body: jsonEncode({'newPlayerId': newPlayerId}))
  //       .then((response) {});
  // }

  // void handleDisconnection(String gameId) {
  //   final endpoint =
  //       '${environment.serverUrl}/games/$gameId/players/disconnect';
  //   // When reloading the page, a disconnect http request is fired on destruction of the game-page component.
  //   // In the initialization of the game-page component, a reconnect request is made which does not allow the
  //   // server to send a response, triggering a Abort 0  error code which is why we catch it if it this this code
  //   _httpClient.delete(Uri.parse(endpoint)).then((response) {
  //     _handleDisconnectResponse();
  //   }).catchError((error) {
  //     final errorMessage = error.toString();
  //     final statusCode = error.statusCode;
  //     if (statusCode != HTTP_ABORT_ERROR) throw Exception(errorMessage);
  //   });
  // }

  Stream<GameUpdateData> observeGameUpdate() {
    return gameUpdate$.stream;
  }

  Stream<Message?> observeNewMessage() {
    return newMessage$.stream;
  }

  Stream<void> observeActionDone() {
    return actionDone$.stream;
  }

  void configureSocket() {
    socketService.on('gameUpdate', (dynamic newData) {
      gameUpdate$.add(GameUpdateData.fromJson(newData));
    });
    socketService.on('newMessage', (dynamic newMessage) {
      newMessage$.add(Message.fromJson(newMessage));
    });
  }

  void handleDisconnectResponse() {
    return;
  }
}
