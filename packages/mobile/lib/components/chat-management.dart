// ignore_for_file: prefer_const_constructors

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/classes/channel.dart';
import 'package:mobile/components/chatbox.dart';
import 'package:mobile/constants/chat-management.constants.dart';
import 'package:rxdart/rxdart.dart';

import '../locator.dart';
import '../services/socket.service.dart';

class ChatManagement extends StatefulWidget {
  const ChatManagement({super.key});
  @override
  State<ChatManagement> createState() => _ChatManagementState();
}

List<Channel> channels = [DEFAULT_CHANNEL];
List<Channel> myChannels = [DEFAULT_CHANNEL];
BehaviorSubject<List<Channel>> channels$ =
    BehaviorSubject<List<Channel>>.seeded(channels);
BehaviorSubject<List<Channel>> myChannels$ =
    BehaviorSubject<List<Channel>>.seeded(myChannels);
BehaviorSubject<bool> shouldOpen$ = BehaviorSubject<bool>.seeded(false);
BehaviorSubject<Channel> channelToOpen$ =
    BehaviorSubject<Channel>.seeded(channels[0]);

class _ChatManagementState extends State<ChatManagement> {
  SocketService socketService = getIt.get<SocketService>();
  @override
  void initState() {
    super.initState();
    configureSockets();
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
    socketService.socket.off('channel:join');
    socketService.socket.off('channel:quit');
    socketService.socket.off('channel:history');
    socketService.socket.off('channel:init');
    socketService.socket.off('channel:allChannels');
  }

  Future<void> configureSockets() async {
    socketService.socket.on('channel:join', (channel) {
      setState(() {
        var typedChannel = Channel.fromJson(channel);
        myChannels.add(typedChannel);
        myChannels$.add(myChannels);
        // TODO APRES RACHAD if (shouldOpen$.value)
        channelToOpen$.add(typedChannel);
        _scaffoldKey.currentState!.openEndDrawer();
      });
      print('channel:join: $channel');
    });

    socketService.socket.on('channel:quit', (channel) {
      setState(() {
        myChannels.removeWhere(
            (x) => x.idChannel == Channel.fromJson(channel).idChannel);

        myChannels$.add(channels);
        print('channel:quit: $channel');
      });
    });

    // TODO SEE WHAT TO DO WITH THIS OTHERWISE DUPLICATES
    // socketService.socket.on('channel:newChannel', (channel) {
    //   setState(() {
    //     channels.add(Channel.fromJson(channel));
    //     channels$.add(channels);
    //   });
    //   print('channel:newChannel: $channel');
    // });

    socketService.socket.on('channel:history', (channel) {
      print('channel:history: $channel');
    });

    socketService.socket.on('channel:init', (s) {
      setState(() {
        shouldOpen$.add(true);
      });
      print('channel:init is done $s');
    });

    socketService.socket.on('channel:allChannels', (channels) {
      setState(() {
        channels = List<Channel>.from(
            channels.map((channel) => Channel.fromJson(channel)));
        var unjoinedChannels = Set<Channel>.from(channels)
            .difference(Set<Channel>.from(myChannels))
            .toList();
        //TODO :HACK FOR NOW
        unjoinedChannels.removeWhere((x) => x.name == 'general');
        channels$.add(unjoinedChannels);
        _channelSearchResult.addAll(channels$.value);
      });

      print('channel:allChannels');
    });
    socketService.socket.emit('channel:init');
    getAllChannels();
  }

  Future<void> createChannel(String channelName) async {
    socketService.emitEvent(
        'channel:newChannel', ChannelName(name: channelName));
  }

  Future<void> joinChannel(int idChannel) async {
    socketService.emitEvent('channel:join', idChannel);
  }

  Future<void> quitChannel(int idChannel) async {
    socketService.emitEvent('channel:quit', idChannel);
  }

  Future<void> getAllChannels() async {
    print('emit channel:allChannels');

    socketService.socket.emit('channel:allChannels');
  }

  var inputController = TextEditingController();
  var searchController = TextEditingController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final meykey = PageStorageKey<String>('chatManager');
  final PageStorageBucket _bucket = PageStorageBucket();
  List<Channel> _channelSearchResult = [];

  onSearchTextChanged(String text) async {
    if (text.isEmpty) {
      setState(() {
        _channelSearchResult.addAll(channels$.value);
      });
      return;
    }
    _channelSearchResult.clear();

    channels$.value.forEach((channel) {
      if (channel.name.contains(text)) _channelSearchResult.add(channel);
    });
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return PageStorage(
      key: meykey,
      bucket: _bucket,
      child: Scaffold(
        key: _scaffoldKey,
        endDrawerEnableOpenDragGesture: false,
        endDrawer: Drawer(child: ChatPage(channel: channelToOpen$.value)),
        body: ListView(
          shrinkWrap: true,
          padding: EdgeInsets.zero,
          children: [
            SizedBox(
              height: 90,
              child: DrawerHeader(
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                ),
                child: Text('Canaux de discussions'),
              ),
            ),
            Padding(
              padding:
                  EdgeInsets.only(left: 10.0, right: 10.0, top: 0, bottom: 0),
              child: TextField(
                onSubmitted: (field) {
                  setState(() {
                    createChannel(field);
                    inputController.clear();
                  });
                },
                controller: inputController,
                decoration: InputDecoration(
                  hintText: 'Créer un canal',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(4),
                    borderSide: BorderSide(
                      color: Colors.black,
                      width: 1,
                      style: BorderStyle.solid,
                    ),
                  ),
                  suffixIcon: IconButton(
                      onPressed: () {
                        setState(() {
                          createChannel(inputController.text);
                          inputController.clear();
                        });
                      },
                      icon: Icon(Icons.add)),
                ),
              ),
            ),
            ListTile(
              title: const Text('Mes canaux'),
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
                            _scaffoldKey.currentState!.openEndDrawer();
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                myChannels$.value[index].name,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 17),
                              ),
                              IconButton(
                                onPressed: myChannels$.value[index].canQuit
                                    ? () {
                                        setState(() {
                                          quitChannel(myChannels$
                                              .value[index].idChannel);
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
            Divider(
              height: 10,
              thickness: 2,
              indent: 15,
              endIndent: 15,
              color: Colors.grey.shade500,
            ),
            ListTile(
              leading: Icon(Icons.search),
              title: TextField(
                controller: searchController,
                decoration: InputDecoration(
                    hintText: 'Tous les canaux', border: InputBorder.none),
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
            Container(
                child: ListView.builder(
                    scrollDirection: Axis.vertical,
                    shrinkWrap: true,
                    itemCount: _channelSearchResult.length,
                    itemBuilder: (_, int index) {
                      return Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Container(
                          decoration: BoxDecoration(
                              borderRadius:
                                  BorderRadius.all(Radius.circular(4.0))),
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  _channelSearchResult[index].name,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(fontSize: 17),
                                ),
                                IconButton(
                                  onPressed: () {
                                    setState(() {
                                      joinChannel(_channelSearchResult[index]
                                          .idChannel);
                                    });
                                  },
                                  icon: Icon(Icons.add),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    })),
          ],
        ),
      ),
    );
  }
}
