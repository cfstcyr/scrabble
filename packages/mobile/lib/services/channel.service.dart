import 'package:audioplayers/audioplayers.dart';
import 'package:mobile/controllers/chat-management.controller.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/channel-message.dart';
import '../classes/channel.dart';
import '../classes/chat-message.dart';
import '../locator.dart';

class ChannelService {
  ChannelService._privateConstructor();

  static final ChannelService _instance = ChannelService._privateConstructor();

  factory ChannelService() {
    return _instance;
  }
  final _chatController = getIt.get<ChatManagementController>();

  Stream<List<ChannelMessage>?> get messagesStream =>
      _chatController.messages$.stream;

  Future<void> sendMessage(Channel channel, ChatMessage message) async {
    _chatController.sendMessage(channel, message);
  }

  void addMessages(List<ChannelMessage> messages) {
    _chatController.messages$.add(messages);
  }
}
