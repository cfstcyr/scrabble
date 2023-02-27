// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';

import '../locator.dart';
import '../services/socket.service.dart';

class ChatManagement extends StatefulWidget {
  @override
  State<ChatManagement> createState() => _ChatManagementState();
}

class _ChatManagementState extends State<ChatManagement> {
  SocketService socketService = getIt.get<SocketService>();
  // @override
  // void initState() {
  //   super.initState();
  //   socketService.initSocket();
  //   // _listenMessages();
  // }

  // Future<void> _listenMessages() async {
  //   SocketService.socket.on('channel:newMessage', (channelMessage) {
  //     log('data: $channelMessage');
  //   });
  // }

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
          child: ElevatedButton.icon(
            onPressed: () {
              print('data: gg');

              this.socketService.emitEvent('channel:newChannel', "{name: 'g'}");
            },
            icon: Icon(Icons.add),
            label: Text('Créer un canal'),
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                fixedSize: Size(70, 70),
                surfaceTintColor: Colors.white,
                foregroundColor: Colors.black,
                shape: BeveledRectangleBorder(
                    borderRadius: BorderRadius.all(Radius.circular(2)))),
          ),
        ),
        ListTile(
          title: const Text('Canaux privés'),
        ),
        Container(
            child: ListView.builder(
                scrollDirection: Axis.vertical,
                shrinkWrap: true,
                itemCount: 3,
                itemBuilder: (_, int index) {
                  return Row(
                    children: [
                      Text('Canaux privé '),
                      IconButton(
                        onPressed: () {
                          // setState(() {
                          //   bool isAccepted =
                          //       addPlayerToLobby(playerWaitingList[index]);
                          //   if (!isAccepted) {
                          //     errorSnackBar(context, FULL_LOBBY_ERROR);
                          //   }
                          // });
                        },
                        icon: Icon(Icons.join_full),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey.shade200,
                            foregroundColor: Colors.green.shade900,
                            shape: CircleBorder()),
                      ),
                    ],
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
          title: const Text('Canaux publics'),
        ),
      ],
    );
  }
}
