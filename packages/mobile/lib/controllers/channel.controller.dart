import 'dart:convert';

import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:mobile/services/socket.service.dart';

import '../classes/channel.dart';
import '../classes/chat-message.dart';
import '../constants/socket-events.dart';
import '../environments/environment.dart';
import '../locator.dart';

class ChatController {
  ChatController._privateConstructor();
  static final ChatController _instance = ChatController._privateConstructor();
  final String endpoint = "${Environment().config.apiUrl}/channel";
  final socketService = getIt.get<SocketService>();
  List<types.Message> _messages = [];
  factory ChatController() {
    return _instance;
  }
  ChatController._internal() {
    socketService.initSocket();
  }

  Future<void> sendMessage(Channel channel, ChatMessage message) async {
    var json = jsonEncode(message.toJson());

    //TO DO : passe channel et message comme les params de l'event
    socketService.emitEvent(CHANNEL_NEW_MESSAGE, message);
  }
}
