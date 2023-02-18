import 'dart:convert';

import 'package:mobile/classes/channel-message.dart';
import 'package:mobile/services/socket.service.dart';

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
    init();
  }

  Future<void> sendMessage(ChannelMessage message) async {
    var json = jsonEncode(message.toJson());
    socketService.emitEvent(CHANNEL_NEW_MESSAGE, message);
  }

  Future<void> init() async {
    socketService.emitEvent(CHANNEL_INIT);
  }
}
