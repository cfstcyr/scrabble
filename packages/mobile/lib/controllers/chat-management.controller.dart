import 'package:flutter/material.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/channel.dart';
import '../constants/chat-management.constants.dart';
import '../locator.dart';
import '../services/socket.service.dart';

class ChatManagementController {
  final String endpoint = CHAT_ENDPOINT;

  SocketService socketService = getIt.get<SocketService>();

  ChatManagementController._privateConstructor() {
    _configureSocket();
  }

  static final ChatManagementController _instance =
      ChatManagementController._privateConstructor();
  List<Channel> channels = [DEFAULT_CHANNEL];
  List<Channel> myChannels = [DEFAULT_CHANNEL];
  BehaviorSubject<List<Channel>> channels$ =
      BehaviorSubject<List<Channel>>.seeded([DEFAULT_CHANNEL]);
  BehaviorSubject<List<Channel>> myChannels$ =
      BehaviorSubject<List<Channel>>.seeded([DEFAULT_CHANNEL]);
  BehaviorSubject<bool> shouldOpen$ = BehaviorSubject<bool>.seeded(false);
  BehaviorSubject<Channel> channelToOpen$ =
      BehaviorSubject<Channel>.seeded(DEFAULT_CHANNEL);
  BehaviorSubject<List<Channel>> channelSearchResult$ =
      BehaviorSubject<List<Channel>>.seeded([]);

  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

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
      Channel typedChannel = Channel.fromJson(channel);
      myChannels.add(typedChannel);
      myChannels$.add(myChannels);
      // TODO APRES RACHAD if (shouldOpen$.value)
      channelToOpen$.add(typedChannel);
      scaffoldKey.currentState!.openEndDrawer();
      handleUnjoinedChannels();
    });

    SocketService.socket.on(QUIT_EVENT, (receivedChannel) {
      myChannels.removeWhere((channel) =>
          channel.idChannel == Channel.fromJson(receivedChannel).idChannel);

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
