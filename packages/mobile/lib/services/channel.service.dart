import 'package:rxdart/rxdart.dart';

import '../classes/channel-message.dart';
import '../classes/channel.dart';
import '../classes/chat-message.dart';
import '../controllers/channel.controller.dart';
import '../locator.dart';

class ChannelService {
  ChannelService._privateConstructor();

  static final ChannelService _instance = ChannelService._privateConstructor();

  factory ChannelService() {
    return _instance;
  }
  final _channelController = getIt.get<ChannelController>();

  BehaviorSubject<List<ChannelMessage>> get messages$ =>
      _channelController.messages$;

  Future<void> sendMessage(Channel channel, ChatMessage message) async {
    _channelController.sendMessage(channel, message);
  }
}
