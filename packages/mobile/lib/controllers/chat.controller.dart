import 'package:mobile/services/socket.service.dart';

import '../constants/socket-events.dart';
import '../locator.dart';

class ChatService {
  ChatService._privateConstructor();
  static final ChatService _instance = ChatService._privateConstructor();

  factory ChatService() {
    return _instance;
  }
  final socketService = getIt.get<SocketService>();

  Future<void> sendMessage(String message) async {
    socketService.emitEvent(CHANNEL_NEW_MESSAGE, message);
  }
}
