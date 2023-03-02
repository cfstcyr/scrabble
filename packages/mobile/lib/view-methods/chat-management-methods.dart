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
BehaviorSubject<List<Channel>> channelSearchResult$ =
    BehaviorSubject<List<Channel>>.seeded([]);
final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

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

OutlineInputBorder setCreateChannelBorder() {
  return OutlineInputBorder(
    borderRadius: BorderRadius.circular(4),
    borderSide: BorderSide(
      color: Colors.black,
      width: 1,
      style: BorderStyle.solid,
    ),
  );
}

SizedBox setDrawerTitle() {
  return SizedBox(
    height: 90,
    child: DrawerHeader(
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
      ),
      child: Text(CHANNELS_TITLE),
    ),
  );
}

setName(String name) {
  return Text(
    name,
    overflow: TextOverflow.ellipsis,
    style: TextStyle(fontSize: 17),
  );
}

Divider setDivider() {
  return Divider(
    height: 10,
    thickness: 2,
    indent: 15,
    endIndent: 15,
    color: Colors.grey.shade500,
  );
}
