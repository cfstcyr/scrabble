// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/channel.dart';
import 'package:rxdart/rxdart.dart';

import '../locator.dart';
import '../services/socket.service.dart';

class ChatManagement extends StatefulWidget {
  @override
  State<ChatManagement> createState() => _ChatManagementState();
}

List<Channel> channels = [
  Channel(idChannel: 1, name: 'general', canQuit: false, private: false)
];
List<Channel> myChannels = [
  Channel(idChannel: 1, name: 'general', canQuit: false, private: false)
];
BehaviorSubject<List<Channel>> channels$ =
    BehaviorSubject<List<Channel>>.seeded(channels);
BehaviorSubject<List<Channel>> myChannels$ =
    BehaviorSubject<List<Channel>>.seeded(myChannels);

class _ChatManagementState extends State<ChatManagement> {
  SocketService socketService = getIt.get<SocketService>();
  @override
  void initState() {
    super.initState();
    configureSockets();
    // _listenMessages();
  }

  Future<void> configureSockets() async {
    socketService.socket.on('channel:join', (channel) {
      setState(() {
        myChannels.add(Channel.fromJson(channel));
        myChannels$.add(myChannels);
      });
      print('channel:join: $channel');
    });
    // TODO
    /**
        this.channels.next(this.channels.value);
        this.joinedChannel.next(newChannel); -- auto join ?
     */
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

    socketService.socket.on('channel:allChannels', (channels) {
      setState(() {
        channels = List<Channel>.from(
            channels.map((channel) => Channel.fromJson(channel)));
        // var unjoinedChannels = Set<Channel>.from(channels)
        //     .difference(Set<Channel>.from(myChannels))
        //     .toList();
        channels$.add(channels);
      });

      print('channel:history: $channels');
    });
    // TODO
    /**
        this.channels.value.delete(channel.idChannel);
        this.channels.next(this.channels.value);
     */
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
    socketService.socket.emit('channel:allChannels');
  }

  var inputController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return ListView(
      // Important: Remove any padding from the ListView.
      padding: EdgeInsets.zero,
      children: [
        SizedBox(
          height: 90,
          child: DrawerHeader(
            decoration: BoxDecoration(
              color: Colors.grey.shade500,
            ),
            child: Text('Canaux de discussions'),
          ),
        ),
        Padding(
          padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 0, bottom: 0),
          child: TextFormField(
            controller: inputController,
            onFieldSubmitted: (field) {
              setState(() {
                inputController.clear();
                createChannel(field);
              });
            },
            decoration: InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'Créer un canal',
            ),
          ),
        ),
        // TODO JOIN CHANNEL
        // ElevatedButton.icon(
        //   onPressed: () {
        //       // TODO
        //     openChannel(channel)
        //   },
        //   icon: Icon(Icons.add),
        //   label: Text('Créer un canal'),
        //   style: ElevatedButton.styleFrom(
        //       backgroundColor: Colors.white,
        //       fixedSize: Size(70, 70),
        //       surfaceTintColor: Colors.white,
        //       foregroundColor: Colors.black,
        //       shape: BeveledRectangleBorder(
        //           borderRadius: BorderRadius.all(Radius.circular(2)))),
        // ),
        ListTile(
          title: const Text('Mes canaux'),
        ),
        Container(
            child: ListView.builder(
                scrollDirection: Axis.vertical,
                shrinkWrap: true,
                itemCount: myChannels$.value.length,
                itemBuilder: (_, int index) {
                  return Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      children: [
                        Text(myChannels$.value[index].name),
                        IconButton(
                          onPressed: () {
                            setState(() {
                              quitChannel(myChannels$.value[index].idChannel);
                            });
                          },
                          icon: Icon(Icons.highlight_remove_outlined),
                          style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey.shade200,
                              foregroundColor: Colors.green.shade900,
                              shape: CircleBorder()),
                        ),
                      ],
                    ),
                  );
                })),
        Divider(
          height: 10,
          thickness: 2,
          indent: 15,
          endIndent: 15,
          color: Colors.grey.shade500,
        ),
        ListTile(
          title: const Text('Tous les canaux'),
        ),
        Container(
            child: ListView.builder(
                scrollDirection: Axis.vertical,
                shrinkWrap: true,
                itemCount: channels$.value.length,
                itemBuilder: (_, int index) {
                  return Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Container(
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius:
                              BorderRadius.all(Radius.circular(10.0))),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Text(channels$.value[index].name),
                            IconButton(
                              onPressed: channels$.value[index].canQuit
                                  ? () {
                                      setState(() {
                                        quitChannel(
                                            channels$.value[index].idChannel);
                                      });
                                    }
                                  : null,
                              icon: Icon(Icons.highlight_remove_outlined),
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.grey.shade200,
                                  foregroundColor: Colors.green.shade900,
                                  shape: CircleBorder()),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                })),
      ],
    );
  }
}
