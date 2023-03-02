// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/components/chatbox.dart';

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

    // code barbare pour ne pas dupliquer configureSockets()
    // SocketService.socket.off(JOIN_EVENT);
    // SocketService.socket.off(QUIT_EVENT);
    // SocketService.socket.off(HISTORY_EVENT);
    // SocketService.socket.off(INIT_EVENT);
    // SocketService.socket.off(ALL_CHANNELS_EVENT);
  }

  final ChatManagementService _chatManagerService =
      getIt.get<ChatManagementService>();

  onSearchTextChanged(String text) async {
    var unjoinedChannels = [...handleUnjoinedChannels()];
    if (text.isEmpty) {
      setState(() {
        channelSearchResult = [...unjoinedChannels];
      });
      channelSearchResult.forEach((channel) {});
      return;
    }
    channelSearchResult.clear();
    unjoinedChannels.forEach((channel) {
      if (channel.name.contains(text)) channelSearchResult.add(channel);
    });

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      endDrawerEnableOpenDragGesture: false,
      endDrawer: Drawer(child: ChatPage(channel: channelToOpen$.value)),
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
                setState(() {
                  _chatManagerService.createChannel(field);
                  inputController.clear();
                });
              },
              controller: inputController,
              decoration: InputDecoration(
                hintText: CREATE_CHANNEL,
                border: setCreateChannelBorder(),
                suffixIcon: IconButton(
                    onPressed: () {
                      setState(() {
                        _chatManagerService.createChannel(inputController.text);
                        inputController.clear();
                      });
                    },
                    icon: Icon(Icons.add)),
              ),
            ),
          ),
          ListTile(
            title: const Text(MY_CHANNELS),
          ),
          ListView.builder(
              scrollDirection: Axis.vertical,
              shrinkWrap: true,
              itemCount: myChannels$.value.length,
              itemBuilder: (_, int index) {
                return Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Container(
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.all(Radius.circular(4.0))),
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          channelToOpen$.add(myChannels$.value[index]);
                          scaffoldKey.currentState!.openEndDrawer();
                        });
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
                                      setState(() {
                                        _chatManagerService.quitChannel(
                                            myChannels$.value[index].idChannel);
                                      });
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
              }),
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
          ListView.builder(
              scrollDirection: Axis.vertical,
              shrinkWrap: true,
              itemCount: channelSearchResult.length,
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
                          setName(channelSearchResult[index].name),
                          IconButton(
                            onPressed: () {
                              setState(() {
                                _chatManagerService.joinChannel(
                                    channelSearchResult[index].idChannel);
                              });
                            },
                            icon: Icon(Icons.add),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
        ],
      ),
    );
  }
}
