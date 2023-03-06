import 'package:mobile/classes/channel-message.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/channel.dart';
import '../classes/chat-message.dart';
import '../constants/socket-events/chat-events.dart';
import '../environments/environment.dart';
import '../locator.dart';

class ChannelController {
  static final ChannelController _instance =
      ChannelController._privateConstructor();
  final String endpoint = "${Environment().config.apiUrl}/channel";
  BehaviorSubject<List<ChannelMessage>> messages$ =
      BehaviorSubject<List<ChannelMessage>>.seeded([]);
  SocketService socketService = getIt.get<SocketService>();

  factory ChannelController() {
    return _instance;
  }
  ChannelController._privateConstructor() {
    _configureSocket();
  }

  void addMessage(ChannelMessage message) {
    List<ChannelMessage> channelMessages = [...messages$.value];
    channelMessages.insert(0, message);
    messages$.add([...channelMessages]);
  }

  Future<void> _configureSocket() async {
    SocketService.socket.on('channel:newMessage', (channelMessage) {
      ChannelMessage parsedMessage = ChannelMessage.fromJson(channelMessage);
      List<ChannelMessage> channelMessages = [...messages$.value];
      channelMessages.insert(0, parsedMessage);
      messages$.add([...channelMessages]);
    });
  }

  Future<void> sendMessage(Channel channel, ChatMessage message) async {
    socketService.emitEvent(CHANNEL_NEW_MESSAGE,
        ChannelMessage(message: message, idChannel: channel.idChannel));
  }
}
