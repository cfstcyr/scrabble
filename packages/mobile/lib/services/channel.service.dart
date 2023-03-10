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

  BehaviorSubject<List<ChannelMessage>> get messages$ =>
      _chatController.messages$;

  Future<void> sendMessage(Channel channel, ChatMessage message) async {
    _chatController.sendMessage(channel, message);
  }

  void addMessage(ChannelMessage message) {
    List<ChannelMessage> channelMessages = [...messages$.value];
    channelMessages.insert(0, message);
    messages$.add([...channelMessages]);
  }
}
