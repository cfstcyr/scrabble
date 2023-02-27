import 'package:mobile/classes/channel-message.dart';
import 'package:mobile/services/socket.service.dart';

import '../classes/channel.dart';
import '../classes/chat-message.dart';
import '../constants/socket-events.dart';
import '../environments/environment.dart';
import '../locator.dart';

class ChannelController {
  ChannelController._privateConstructor();
  static final ChannelController _instance =
      ChannelController._privateConstructor();
  final String endpoint = "${Environment().config.apiUrl}/channel";
  final socketService = getIt.get<SocketService>();
  factory ChannelController() {
    return _instance;
  }
  ChannelController._internal() {
    // socketService.initSocket();
  }

  Future<void> sendMessage(Channel channel, ChatMessage message) async {
    socketService.emitEvent(CHANNEL_NEW_MESSAGE,
        ChannelMessage(message: message, idChannel: channel.idChannel));
  }
}
