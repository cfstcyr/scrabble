// ignore_for_file: prefer_const_constructors

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/components/chatbox.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/channel.dart';
import '../constants/chat-management.constants.dart';
import '../locator.dart';
import '../services/chat-management.service.dart';
import '../view-methods/chat-management-methods.dart';

class ChatManagement extends StatefulWidget {
  const ChatManagement({super.key});
  @override
  State<ChatManagement> createState() => _ChatManagementState();
}

class _ChatManagementState extends State<ChatManagement> {
  @override
  void initState() {
    super.initState();
  }

  //hack allows for drawer open after closing but it duplicates drawer
  @override
  void setState(fn) {
    if (mounted) {
      super.setState(fn);
    }
  }

  @override
  void dispose() {
    super.dispose();
    _debounce?.cancel();
  }

  final ChatManagementService _chatManagerService =
      getIt.get<ChatManagementService>();
  final inputController = TextEditingController();
  final searchController = TextEditingController();
  Timer? _debounce;

  List<Channel> get channels => _chatManagerService.channels;
  List<Channel> get myChannels => _chatManagerService.myChannels;
  BehaviorSubject<List<Channel>> get channels$ => _chatManagerService.channels$;
  BehaviorSubject<List<Channel>> get myChannels$ =>
      _chatManagerService.myChannels$;
  BehaviorSubject<bool> get shouldOpen$ => _chatManagerService.shouldOpen$;
  BehaviorSubject<Channel> get channelToOpen$ =>
      _chatManagerService.channelToOpen$;
  BehaviorSubject<List<Channel>> get channelSearchResult$ =>
      _chatManagerService.channelSearchResult$;
  GlobalKey<ScaffoldState> get scaffoldKey => _chatManagerService.scaffoldKey;

  onSearchTextChanged(String text) async {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 200), () {
      var unjoinedChannels = [..._chatManagerService.handleUnjoinedChannels()];
      if (text.isEmpty) {
        channelSearchResult$.add([...unjoinedChannels]);
        channelSearchResult$.value.forEach((channel) {});
        return;
      }
      var channelSearchResult = [];
      unjoinedChannels.forEach((channel) {
        if (channel.name.contains(text)) channelSearchResult.add(channel);
      });
      channelSearchResult$.add([...channelSearchResult]);
    });
  }

  StreamBuilder handleChannelsChange() {
    return StreamBuilder(
      stream: CombineLatestStream.list(
          [channels$.stream, channelSearchResult$.stream]),
      builder: (context, snapshot) {
        return ListView.builder(
            scrollDirection: Axis.vertical,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            itemCount: channelSearchResult$.value.length,
            itemBuilder: (_, int index) {
              return Padding(
                padding: const EdgeInsets.all(8.0),
                child: Container(
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.all(Radius.circular(4.0))),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        setName(channelSearchResult$.value[index].name),
                        IconButton(
                          onPressed: () {
                            setState(() {
                              _chatManagerService.joinChannel(
                                  channelSearchResult$.value[index].idChannel);
                            });
                          },
                          icon: Icon(Icons.add),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            });
      },
    );
  }

  StreamBuilder handleMyChannelsChange() {
    return StreamBuilder(
      stream: CombineLatestStream.list(
          [myChannels$.stream, shouldOpen$.stream, channelToOpen$.stream]),
      builder: (context, snapshot) {
        return ListView.builder(
            scrollDirection: Axis.vertical,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            itemCount: myChannels$.value.length,
            itemBuilder: (_, int index) {
              return Padding(
                padding: const EdgeInsets.all(8.0),
                child: Container(
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.all(Radius.circular(4.0))),
                  child: InkWell(
                    onTap: () {
                      channelToOpen$.add(myChannels$.value[index]);
                      scaffoldKey.currentState!.openEndDrawer();
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          setName(myChannels$.value[index].name),
                          IconButton(
                            onPressed: myChannels$.value[index].canQuit
                                ? () {
                                    _chatManagerService.quitChannel(
                                        myChannels$.value[index].idChannel);
                                  }
                                : null,
                            icon: Icon(Icons.output_rounded),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            });
      },
    );
  }

  StreamBuilder handleDrawerChannelChange() {
    return StreamBuilder(
      stream: channelToOpen$.stream,
      builder: (context, snapshot) {
        return ChatPage(channel: channelToOpen$.value);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      endDrawerEnableOpenDragGesture: false,
      endDrawer: Drawer(child: handleDrawerChannelChange()),
      body: ListView(
        shrinkWrap: true,
        padding: EdgeInsets.zero,
        children: [
          setDrawerTitle(),
          Padding(
            padding:
                EdgeInsets.only(left: 10.0, right: 10.0, top: 0, bottom: 0),
            child: TextField(
              onSubmitted: (field) {
                _chatManagerService.createChannel(field);
                inputController.clear();
              },
              controller: inputController,
              decoration: InputDecoration(
                hintText: CREATE_CHANNEL,
                border: setCreateChannelBorder(),
                suffixIcon: IconButton(
                    onPressed: () {
                      _chatManagerService.createChannel(inputController.text);
                      inputController.clear();
                    },
                    icon: Icon(Icons.add)),
              ),
            ),
          ),
          ListTile(
            title: const Text(MY_CHANNELS),
          ),
          handleMyChannelsChange(),
          setDivider(),
          ListTile(
            leading: Icon(Icons.search),
            title: TextField(
              controller: searchController,
              decoration: InputDecoration(
                  hintText: ALL_CHANNELS, border: InputBorder.none),
              onChanged: onSearchTextChanged,
            ),
            trailing: IconButton(
              icon: Icon(Icons.clear),
              onPressed: () {
                searchController.clear();
                onSearchTextChanged('');
              },
            ),
          ),
          handleChannelsChange(),
        ],
      ),
    );
  }
}
