import 'package:mobile/services/socket.service.dart';

import '../constants/socket-events.dart';
import '../environments/environment.dart';
import '../locator.dart';

class ChatController {
  ChatController._privateConstructor();
  static final ChatController _instance = ChatController._privateConstructor();
  final String endpoint = "${Environment().config.apiUrl}/channel";

  factory ChatController() {
    return _instance;
  }
  final socketService = getIt.get<SocketService>();

  Future<void> sendMessage(String message) async {
    socketService.emitEvent(CHANNEL_NEW_MESSAGE, message);
  }
}
