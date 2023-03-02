import 'package:mobile/constants/endpoint.constants.dart';

import '../classes/channel.dart';
import '../constants/chat-management.constants.dart';
import '../locator.dart';
import '../services/socket.service.dart';
import '../view-methods/chat-management-methods.dart';

class ChatManagementController {
  final String endpoint = CHAT_ENDPOINT;

  SocketService socketService = getIt.get<SocketService>();

  ChatManagementController._privateConstructor() {
    _configureSocket();
  }

  static final ChatManagementController _instance =
      ChatManagementController._privateConstructor();

  factory ChatManagementController() {
    return _instance;
  }

  Future<void> createChannel(String channelName) async {
    if (channelName.isEmpty) return;
    socketService.emitEvent(CREATE_EVENT, ChannelName(name: channelName));
  }

  Future<void> joinChannel(int idChannel) async {
    socketService.emitEvent(JOIN_EVENT, idChannel);
  }

  Future<void> quitChannel(int idChannel) async {
    socketService.emitEvent(QUIT_EVENT, idChannel);
  }

  Future<void> getAllChannels() async {
    SocketService.socket.emit(ALL_CHANNELS_EVENT);
  }

  Future<void> _configureSocket() async {
    SocketService.socket.on(JOIN_EVENT, (channel) {
      var typedChannel = Channel.fromJson(channel);
      myChannels.add(typedChannel);
      myChannels$.add(myChannels);
      // TODO APRES RACHAD if (shouldOpen$.value)
      channelToOpen$.add(typedChannel);
      scaffoldKey.currentState!.openEndDrawer();
      handleUnjoinedChannels();
    });

    SocketService.socket.on(QUIT_EVENT, (channel) {
      myChannels.removeWhere(
          (x) => x.idChannel == Channel.fromJson(channel).idChannel);

      myChannels$.add(myChannels);
      handleUnjoinedChannels();
    });

    // TODO w/ rachad mr
    // SocketService.socket.on(HISTORY_EVENT, (channel) {
    //   print('channel:history: $channel');
    // });

    SocketService.socket.on(INIT_DONE_EVENT, (s) {
      shouldOpen$.add(true);
    });

    SocketService.socket.on(ALL_CHANNELS_EVENT, (receivedChannels) {
      channels = List<Channel>.from(
          receivedChannels.map((channel) => Channel.fromJson(channel)));

      channels$.add(handleUnjoinedChannels());
    });
    SocketService.socket.emit(INIT_EVENT);
    getAllChannels();
  }
}
