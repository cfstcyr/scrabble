import 'dart:convert';

import 'package:mobile/services/socket.service.dart';

import '../classes/channel.dart';
import '../classes/chat-message.dart';
import '../constants/socket-events/chat-events.dart';
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
    var json = jsonEncode(message.toJson());

    //TO DO : passe channel et message comme les params de l'event
    socketService.emitEvent(CHANNEL_NEW_MESSAGE, message);
  }
}
