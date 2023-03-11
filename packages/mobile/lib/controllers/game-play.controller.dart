import 'package:http/http.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/game/game-message.dart';
import 'package:mobile/classes/game/game-update.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/constants/socket-events/game-events.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:rxdart/rxdart.dart';

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

  final Subject<void> _actionDone = PublishSubject();

  Stream<void> get actionDoneEvent => _actionDone.stream;

  final Subject<GameUpdateData> _gameUpdate = PublishSubject();

  Stream<GameUpdateData> get gameUpdateEvent => _gameUpdate.stream;

  final Subject<GameMessage?> _message = PublishSubject();

  Stream<GameMessage?> get messageEvent => _message.stream;

  final BehaviorSubject<GameUpdateData> gameUpdate =
      BehaviorSubject<GameUpdateData>();
  final BehaviorSubject<GameMessage?> newMessage =
      BehaviorSubject<GameMessage?>.seeded(null);
  final PublishSubject<void> actionDone$ = PublishSubject<void>();

  Future<void> sendAction(ActionData actionData) async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/action");
    post(endpoint, body: actionData).then((_) => _actionDone.add(null));
  }

  Future<void> leaveGame() async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/leave");
    await delete(endpoint);
  }

  void configureSocket() {
    socketService.on(GAME_UPDATE_EVENT_NAME, (dynamic newData) {
      gameUpdate.add(GameUpdateData.fromJson(newData));
    });
    socketService.on(GAME_MESSAGE_EVENT_NAME, (dynamic newMessage) {
      newMessage.add(GameMessage.fromJson(newMessage));
    });
  }

  void handleDisconnectResponse() {
    return;
  }
}
