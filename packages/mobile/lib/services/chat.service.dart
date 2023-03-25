import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:mobile/constants/assets.constants.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:rxdart/rxdart.dart';
import 'package:socket_io_client/socket_io_client.dart';

import '../classes/channel-message.dart';
import '../classes/channel.dart';
import '../classes/chat-message.dart';
import '../constants/chat-management.constants.dart';
import '../locator.dart';
import 'socket.service.dart';

class ChatService {
  static final AudioPlayer _notificationPlayer = AudioPlayer();
  final String endpoint = CHAT_ENDPOINT;

  SocketService socketService = getIt.get<SocketService>();

  ChatService._privateConstructor() {
    socketService.getSocket().onConnect((_) {
      _configureSocket();
    });

    socketService.getSocket().onDisconnect((_) {
      _resetSubjects();
    });
  }

  factory ChatService() {
    return _instance;
  }

  static final ChatService _instance =
      ChatService._privateConstructor();

  BehaviorSubject<List<Channel>> _joinableChannels$ =
      BehaviorSubject<List<Channel>>.seeded([]);

  BehaviorSubject<List<Channel>> _myChannels$ =
      BehaviorSubject<List<Channel>>.seeded([]);

  BehaviorSubject<int?> _openedChannelId$ = BehaviorSubject.seeded(null);

  ValueStream<List<Channel>> get joinableChannels => _joinableChannels$.stream;

  ValueStream<List<Channel>> get myChannels => _myChannels$.stream;

  ValueStream<int?> get openedChannelId => _openedChannelId$.stream;

  Stream<bool> get hasUnreadMessages =>
      myChannels.switchMap((List<Channel> channels) => Stream.value(
          channels.any((Channel channel) => channel.messages
              .any((ChannelMessage message) => message.isNotRead))));

  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  Future<void> sendMessage(Channel channel, ChatMessage message) async {
    socketService.emitEvent(MESSAGE_EVENT,
        ChannelMessage(message: message, idChannel: channel.idChannel));
  }

  Future<void> createChannel(String channelName) async {
    if (channelName.isEmpty) return;
    socketService.emitEvent(CREATE_EVENT, ChannelCreation(name: channelName));
  }

  Future<void> joinChannel(int idChannel) async {
    socketService.emitEvent(JOIN_CHANNEL_EVENT, idChannel);
  }

  Future<void> quitChannel(int idChannel) async {
    socketService.emitEvent(QUIT_CHANNEL_EVENT, idChannel);
  }

  void openChannel(Channel channel) {
    print('open: ${channel.name}');
    _openedChannelId$.add(channel.idChannel);
  }

  void closeChannel() {
    _openedChannelId$.add(null);
  }

  void readChannelMessages(Channel channel) {
    // channel.messages = channel.messages.where((ChannelMessage m) => m.isNotRead).map((ChannelMessage m) {
    //   print(m.message.content);
    //   m.isRead = true;
    //   return m;
    // }).toList();
  }

  Future<void> _configureSocket() async {
    socketService.on(MESSAGE_EVENT, (receivedChannelMessage) {
      ChannelMessage channelMessage =
          ChannelMessage.fromJson(receivedChannelMessage);
      channelMessage.isRead = false;

      _handleNewMessage(channelMessage);
      _notificationPlayer.play(AssetSource(NOTIFICATION_PATH));
    });

    socketService.on(JOIN_CHANNEL_EVENT, (channel) {
      Channel joinedChannel = Channel.fromJson(channel);
      _handleJoinChannel(joinedChannel);
    });

    socketService.on(QUIT_CHANNEL_EVENT, (receivedChannel) {
      Channel channel = Channel.fromJson(receivedChannel);
      _handleQuitChannel(channel);
    });

    socketService.on(JOINABLE_CHANNELS_EVENT, (receivedJoinableChannels) {
      List<Channel> joinableChannels =
          (receivedJoinableChannels as List<dynamic>)
              .map((dynamic c) => Channel.fromJson(c))
              .toList();

      _joinableChannels$.add(joinableChannels);
    });

    socketService.on(CHANNEL_HISTORY_EVENT, (receivedChannelMessages) {
      List<ChannelMessage> channelMessageHistory =
          (receivedChannelMessages as List<dynamic>)
              .map((dynamic channelMessage) =>
                  ChannelMessage.fromJson(channelMessage))
              .toList();

      for(ChannelMessage channelMessage in channelMessageHistory) {
        _handleNewMessage(channelMessage);
      }
    });

    SocketService.socket.emit(INIT_EVENT);
  }

  void _handleNewMessage(ChannelMessage channelMessage) {
    try {
      Channel channelOfMessage = _myChannels$.value
          .firstWhere((Channel c) => c.idChannel == channelMessage.idChannel);

      List<ChannelMessage> messages = [...channelOfMessage.messages];

      messages.insert(0, channelMessage);

      channelOfMessage.messages = messages;

      _myChannels$.value.removeWhere((Channel c) => c.idChannel == channelOfMessage.idChannel);

      List<Channel> myChannels = [..._myChannels$.value];

      myChannels.insert(0, channelOfMessage);
      _myChannels$.add(myChannels);
    } on StateError catch (_) {
      throw Exception(
          'Message received from a channel that user is not a part of');
    }
  }

  void _handleJoinChannel(Channel joinedChannel) {
    _myChannels$.add([...myChannels.value, joinedChannel]);
    _openedChannelId$.add(joinedChannel.idChannel);
  }

  void _handleQuitChannel(Channel channel) {
    print(channel.idChannel);
    List<Channel> myChannels = [..._myChannels$.value];
    myChannels.remove(channel);
    _myChannels$.add(myChannels);
    if (_openedChannelId$.value == channel.idChannel) _openedChannelId$.add(null);
  }

  void _resetSubjects() {
    _joinableChannels$ = BehaviorSubject<List<Channel>>.seeded([]);
    _myChannels$ = BehaviorSubject<List<Channel>>.seeded([]);
    _openedChannelId$ = BehaviorSubject.seeded(null);
  }
}
