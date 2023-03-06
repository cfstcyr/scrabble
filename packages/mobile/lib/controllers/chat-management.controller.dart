import 'package:flutter/material.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:rxdart/rxdart.dart';
import 'package:socket_io_client/socket_io_client.dart';

import '../classes/channel-message.dart';
import '../classes/channel.dart';
import '../classes/chat-message.dart';
import '../constants/chat-management.constants.dart';
import '../locator.dart';
import '../services/socket.service.dart';

class ChatManagementController {
  final String endpoint = CHAT_ENDPOINT;

  SocketService socketService = getIt.get<SocketService>();

  ChatManagementController._privateConstructor() {
    _configureSocket();

    socketService.getSocket().onDisconnect((_) {
      resetSubjects();
    });

    socketService.getSocket().onConnect((_) {
      resetSubjects();
    });
  }

  static final ChatManagementController _instance =
      ChatManagementController._privateConstructor();
  List<Channel> channels = [];
  List<Channel> myChannels = [];
  BehaviorSubject<List<Channel>> channels$ =
      BehaviorSubject<List<Channel>>.seeded([]);
  BehaviorSubject<List<Channel>> myChannels$ =
      BehaviorSubject<List<Channel>>.seeded([]);
  BehaviorSubject<bool> shouldOpen$ = BehaviorSubject<bool>.seeded(false);
  BehaviorSubject<Channel> channelToOpen$ =
      BehaviorSubject<Channel>.seeded(DEFAULT_CHANNEL);
  BehaviorSubject<List<Channel>> channelSearchResult$ =
      BehaviorSubject<List<Channel>>.seeded([]);
  BehaviorSubject<List<ChannelMessage>> messages$ =
      BehaviorSubject<List<ChannelMessage>>.seeded([]);

  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  factory ChatManagementController() {
    return _instance;
  }

  void resetSubjects() {
    channels = [];
    myChannels = [];
    channels$ = BehaviorSubject<List<Channel>>.seeded([]);
    myChannels$ = BehaviorSubject<List<Channel>>.seeded([]);
    channelSearchResult$ = BehaviorSubject<List<Channel>>.seeded([]);
    shouldOpen$ = BehaviorSubject<bool>.seeded(false);
    SocketService.socket.emit(INIT_EVENT);
    getAllChannels();
  }

  Future<void> createChannel(String channelName) async {
    if (channelName.isEmpty) return;
    socketService.emitEvent(CREATE_EVENT, ChannelCreation(name: channelName));
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

  Future<void> sendMessage(Channel channel, ChatMessage message) async {
    socketService.emitEvent(MESSAGE_EVENT,
        ChannelMessage(message: message, idChannel: channel.idChannel));
  }

  Future<void> _configureSocket() async {
    SocketService.socket.on(JOIN_EVENT, (channel) {
      Channel typedChannel = Channel.fromJson(channel);
      myChannels.add(typedChannel);
      myChannels$.add(myChannels);
      channelToOpen$.add(typedChannel);
      if (shouldOpen$.value) scaffoldKey.currentState!.openEndDrawer();
      handleUnjoinedChannels();
    });

    SocketService.socket.on(QUIT_EVENT, (receivedChannel) {
      myChannels.removeWhere((channel) =>
          channel.idChannel == Channel.fromJson(receivedChannel).idChannel);

      myChannels$.add(myChannels);
      handleUnjoinedChannels();
    });

    SocketService.socket.on(HISTORY_EVENT, (chatMessages) {
      List<ChannelMessage> history = List<ChannelMessage>.from(
          chatMessages.map((message) => ChannelMessage.fromJson(message)));
      int idChannel = history.isNotEmpty ? history[0].idChannel : 0;
      if (idChannel != 0) {
        Channel channelToFill = myChannels$.value
            .firstWhere((channel) => channel.idChannel == idChannel);
        channelToFill.messages = [...history];
      }
    });

    SocketService.socket.on(INIT_DONE_EVENT, (s) {
      shouldOpen$.add(true);
    });

    SocketService.socket.on(MESSAGE_EVENT, (channelMessage) {
      ChannelMessage parsedMessage = ChannelMessage.fromJson(channelMessage);
      List<ChannelMessage> channelMessages = [...messages$.value];
      channelMessages.insert(0, parsedMessage);
      messages$.add([...channelMessages]);
    });

    SocketService.socket.on(ALL_CHANNELS_EVENT, (receivedChannels) {
      channels = List<Channel>.from(
          receivedChannels.map((channel) => Channel.fromJson(channel)));

      channels$.add(handleUnjoinedChannels());
    });
    SocketService.socket.emit(INIT_EVENT);
    getAllChannels();
  }

  List<Channel> handleUnjoinedChannels() {
    List<Channel> unjoinedChannels = [...channels];
    myChannels$.value.forEach((myChannel) {
      unjoinedChannels.removeWhere((channel) {
        return channel.name == myChannel.name && !channel.isPrivate;
      });
    });
    channelSearchResult$.add([...unjoinedChannels]);
    return channelSearchResult$.value;
  }
}
