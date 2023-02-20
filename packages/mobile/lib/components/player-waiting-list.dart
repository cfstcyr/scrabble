import 'package:flutter/material.dart';

import '../constants/create-lobby-constants.dart';
import '../view-methods/create-lobby-methods.dart';
import 'error-pop-up.dart';

class PlayerWaitingList extends StatefulWidget {
  const PlayerWaitingList({
    super.key,
  });

  @override
  State<PlayerWaitingList> createState() => _PlayerWaitingListState();
}

class _PlayerWaitingListState extends State<PlayerWaitingList> {
  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var style = theme.textTheme.displayMedium!.copyWith(
      color: theme.colorScheme.onPrimary,
    );
    return Padding(
      padding: EdgeInsets.only(left: 30.0, right: 30.0, top: 0, bottom: 0),
      child: Container(
        decoration: BoxDecoration(
            border: Border.all(
              color: Colors.black,
            ),
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.all(Radius.circular(5.0))),
        child: ListView.builder(
          itemCount: playerWaitingList.length,
          itemBuilder: (_, int index) {
            return Padding(
              padding: EdgeInsets.only(
                  left: 15.0, right: 15.0, top: 5.0, bottom: 5.0),
              child: Container(
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(Radius.circular(10.0))),
                child: Row(
                  children: <Widget>[
                    Padding(
                      padding: EdgeInsets.only(
                          left: 15.0, right: 0, top: 10.0, bottom: 10.0),
                      child: setWaitingPlayerIcon(index),
                    ),
                    Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(
                            left: 15.0, right: 5.0, top: 0, bottom: 0),
                        child: Text(playerWaitingList[index].username),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.only(
                          left: 5.0, right: 5.0, top: 0, bottom: 0),
                      child: Container(
                        child: IconButton(
                          onPressed: () {
                            setState(() {
                              bool isAccepted =
                                  addPlayerToLobby(playerWaitingList[index]);
                              if (!isAccepted) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => ErrorPopup(
                                          errorMessage: FULL_LOBBY_ERROR)),
                                );
                              }
                            });
                          },
                          icon: Icon(Icons.check),
                          style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey.shade200,
                              foregroundColor: Colors.green.shade900,
                              shape: CircleBorder()),
                        ),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.only(
                          left: 5.0, right: 15.0, top: 0, bottom: 0),
                      child: IconButton(
                        onPressed: () {
                          setState(() {
                            refusePlayer(playerWaitingList[index]);
                          });
                        },
                        icon: Icon(Icons.clear_outlined),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey.shade200,
                            foregroundColor: Colors.black,
                            shape: CircleBorder()),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
