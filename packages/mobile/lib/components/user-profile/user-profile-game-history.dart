import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/classes/game-history.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/user.service.dart';

import '../../utils/duration.dart';

class UserProfileGameHistory extends StatelessWidget {
  final UserService _userService = getIt.get<UserService>();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(SPACE_3),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Historique de partie',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w500),
            ),
            FutureBuilder(
              future: _userService.getGameHistory(),
              builder: (context, snapshot) => snapshot.hasData
                  ? Table(
                      children: snapshot.data!
                          .map<TableRow>((gameHistory) => TableRow(children: [
                                TableCell(
                                    child: Text(DateFormat('d MMMM yyyy', 'fr')
                                        .format(gameHistory.startTime))),
                                TableCell(
                                    child: Text(
                                        "${minutes(gameHistory.endTime.difference(gameHistory.startTime))} m ${seconds(gameHistory.endTime.difference(gameHistory.startTime))} s")),
                              ]))
                          .toList(),
                    )
                  : snapshot.hasError
                      ? Text(
                          'Impossible de charger l\'historique de partie ${snapshot.error}')
                      : Container(),
            )
          ],
        ),
      ),
    );
  }
}
