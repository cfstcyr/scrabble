// ignore_for_file: prefer_const_constructors

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/components/chatbox.dart';
import 'package:mobile/services/chat.service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/channel.dart';
import '../constants/chat-management.constants.dart';
import '../locator.dart';
import '../view-methods/chat-management-methods.dart';

class ChatManagement extends StatefulWidget {
  const ChatManagement({super.key});

  @override
  State<ChatManagement> createState() => _ChatManagementState();
}

class _ChatManagementState extends State<ChatManagement> {
  final ChatService _chatService = getIt.get<ChatService>();

  final channelCreationNameController = TextEditingController();
  final channelSearchController = TextEditingController();
  Timer? _debounce;

  Stream<List<Channel>> _myChannels = Stream.empty();
  Stream<Channel?> _openedChannel = Stream.empty();
  Stream<List<Channel>> _joinableChannels = Stream.empty();

  late StreamSubscription openChannelSubscription;

  @override
  void initState() {
    super.initState();

    _myChannels = _chatService.myChannels;
    _openedChannel = CombineLatestStream<dynamic, Channel?>(
        [_chatService.myChannels, _chatService.openedChannelId], (values) {
      List<Channel> myChannels = values[0];
      int? openedChannelId = values[1];

      if (openedChannelId == null) return null;

      try {
        return myChannels.firstWhere(
            (Channel channel) => channel.idChannel == openedChannelId);
      } on StateError catch (_) {
        return null;
      }
    });

    openChannelSubscription = _chatService.openedChannelId.listen((int? id) {
      print('do on channel: $id');

      if (id != null) {
        _chatService.scaffoldKey.currentState!.openEndDrawer();
      } else {
        _chatService.scaffoldKey.currentState?.closeEndDrawer();
      }
    });

    _joinableChannels = _chatService.joinableChannels.switchMap(
        (List<Channel> channels) => Stream.value(channels
            .where((Channel channel) =>
                channelSearchController.text == '' ||
                channel.name != channelSearchController.text)
            .toList()));
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
    // _debounce?.cancel();
    _chatService.closeChannel();
    openChannelSubscription.cancel();
  }

  // onSearchTextChanged(String text) async {
  //   if (_debounce?.isActive ?? false) _debounce!.cancel();
  //   _debounce = Timer(const Duration(milliseconds: 200), () {
  //     var unjoinedChannels = [..._chatManagerService.handleUnjoinedChannels()];
  //     if (text.isEmpty) {
  //       _channelSearchResult$.add([...unjoinedChannels]);
  //       _channelSearchResult$.value.forEach((channel) {});
  //       return;
  //     }
  //     var channelSearchResult = [];
  //     unjoinedChannels.forEach((channel) {
  //       if (channel.name.contains(text)) channelSearchResult.add(channel);
  //     });
  //     _channelSearchResult$.add([...channelSearchResult]);
  //   });
  // }

  StreamBuilder joinableChannelsWidget() {
    return StreamBuilder(
      stream: _joinableChannels,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return SizedBox.shrink();

        List<Channel> joinableChannels = snapshot.data!;
        return ListView.builder(
            scrollDirection: Axis.vertical,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            itemCount: joinableChannels.length,
            itemBuilder: (_, int index) {
              Channel joinableChannel = joinableChannels[index];

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
                        setName(joinableChannel.name),
                        IconButton(
                          onPressed: () {
                            setState(() {
                              _chatService
                                  .joinChannel(joinableChannel.idChannel);
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

  StreamBuilder myChannelsWidget() {
    return StreamBuilder(
      stream: _myChannels,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return SizedBox.shrink();

        List<Channel> myChannels = snapshot.data!;

        return ListView.builder(
            scrollDirection: Axis.vertical,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            itemCount: myChannels.length,
            itemBuilder: (_, int index) {
              Channel currentChannel = myChannels[index];
              return Padding(
                padding: const EdgeInsets.only(left: 8, right: 8, bottom: 8),
                child: Container(
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.all(Radius.circular(4.0))),
                  child: InkWell(
                    onTap: () {
                      _chatService.readChannelMessages(currentChannel);
                      _chatService.openChannel(currentChannel);
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(
                          left: 8, right: 8, top: 4, bottom: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          setName(currentChannel.name),
                          IconButton(
                            onPressed: currentChannel.canQuit
                                ? () {
                                    _chatService
                                        .quitChannel(currentChannel.idChannel);
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

  StreamBuilder channelToOpenWidget() {
    return StreamBuilder(
      stream: _openedChannel,
      builder: (context, snapshot) {
        return snapshot.hasData
            ? ChatPage(channel: snapshot.data!)
            : SizedBox.shrink();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _chatService.scaffoldKey,
      endDrawerEnableOpenDragGesture: false,
      endDrawer: Drawer(child: channelToOpenWidget()),
      body: ListView(
        shrinkWrap: true,
        padding: EdgeInsets.zero,
        children: [
          setDrawerTitle(),
          Padding(
            padding: EdgeInsets.only(left: 10.0, right: 10.0),
            child: TextField(
              onSubmitted: (field) {
                _handleCreateChannel(channelCreationNameController.text);
              },
              controller: channelCreationNameController,
              decoration: InputDecoration(
                hintText: CREATE_CHANNEL,
                border: setCreateChannelBorder(),
                suffixIcon: IconButton(
                    onPressed: () {
                      _handleCreateChannel(channelCreationNameController.text);
                    },
                    icon: Icon(Icons.add)),
              ),
            ),
          ),
          ListTile(
            title: const Text(MY_CHANNELS),
          ),
          myChannelsWidget(),
          setDivider(),
          ListTile(
            leading: Icon(Icons.search),
            title: TextField(
              controller: channelSearchController,
              decoration: InputDecoration(
                  hintText: ALL_CHANNELS, border: InputBorder.none),
              // onChanged: onSearchTextChanged,
            ),
            trailing: IconButton(
              icon: Icon(Icons.clear),
              onPressed: () {
                channelSearchController.clear();
              },
            ),
          ),
          joinableChannelsWidget(),
        ],
      ),
    );
  }

  void _handleCreateChannel(String channelName) {
    _chatService.createChannel(channelName);
    channelCreationNameController.clear();
  }
}
