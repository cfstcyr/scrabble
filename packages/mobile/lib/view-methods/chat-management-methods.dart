import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/classes/channel.dart';
import 'package:rxdart/rxdart.dart';

import '../constants/chat-management.constants.dart';
import '../locator.dart';
import '../services/socket.service.dart';

List<Channel> channels = [DEFAULT_CHANNEL];
List<Channel> myChannels = [DEFAULT_CHANNEL];
BehaviorSubject<List<Channel>> channels$ =
    BehaviorSubject<List<Channel>>.seeded(channels);
BehaviorSubject<List<Channel>> myChannels$ =
    BehaviorSubject<List<Channel>>.seeded(myChannels);
BehaviorSubject<bool> shouldOpen$ = BehaviorSubject<bool>.seeded(false);
BehaviorSubject<Channel> channelToOpen$ =
    BehaviorSubject<Channel>.seeded(channels[0]);
SocketService socketService = getIt.get<SocketService>();

var inputController = TextEditingController();
var searchController = TextEditingController();
List<Channel> channelSearchResult = [];

Future<void> createChannel(String channelName) async {
  socketService.emitEvent('channel:newChannel', ChannelName(name: channelName));
}

Future<void> joinChannel(int idChannel) async {
  socketService.emitEvent('channel:join', idChannel);
}

Future<void> quitChannel(int idChannel) async {
  socketService.emitEvent('channel:quit', idChannel);
}

Future<void> getAllChannels() async {
  socketService.socket.emit('channel:allChannels');
}
