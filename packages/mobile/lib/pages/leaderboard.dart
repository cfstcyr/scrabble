import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/user.service.dart';

import '../components/table.dart';

class LeaderBoardPage extends StatelessWidget {
  UserService _userService = getIt.get<UserService>();
  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      hasBackButton: true,
      title: "Classement des meilleurs utilisateurs",
      body: SingleChildScrollView(
          child: Container(
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 600,
              child: Center(
                child: Padding(
                  padding: EdgeInsets.all(SPACE_3),
                  child: Card(
                      child: Padding(
                    padding: EdgeInsets.all(SPACE_2),
                    child: FutureBuilder<List<RatedUser>>(
                        future: _userService.requestRatingLeaderboard(),
                        builder: (context, users) => users.data != null &&
                                users.data!.isNotEmpty
                            ? AppTable(data: users.data!, columns: [
                                AppTableColumn(
                                  title: '',
                                  builder: (context, row) =>
                                      handleUserRank(row.index),
                                ),
                                AppTableColumn(
                                  title: 'Rang',
                                  builder: (context, row) =>
                                      Text("${row.index + 1}"),
                                ),
                                AppTableColumn(
                                  title: 'Utilisateur',
                                  builder: (context, row) =>
                                      Text("${row.data.user.username}"),
                                ),
                                AppTableColumn(
                                  title: 'Classement Elo',
                                  builder: (context, row) =>
                                      Text("${row.data.rating.round()}"),
                                ),
                              ])
                            : users.hasError
                                ? handleTextResponse(
                                    "Une erreur s'est produite", Colors.red)
                                : handleTextResponse(
                                    'aucun résultat', Colors.grey.shade600)),
                  )),
                ),
              ),
            )
          ],
        ),
      )),
    );
  }
}

Widget handleUserRank(int index) {
  return index < 3 ? topRank(index) : Container();
}

Widget topRank(int index) {
  switch (index) {
    case (0):
      return Icon(Icons.star);
    case (1):
      return Icon(Icons.star_half);
    case (2):
      return Icon(Icons.star_border);
  }
  return Container();
}

Widget handleTextResponse(String text, Color color) {
  return SizedBox(
    width: 600,
    child: Padding(
      padding: const EdgeInsets.only(left: 8, right: 8, bottom: 8),
      child: Container(
        alignment: Alignment.center,
        decoration:
            BoxDecoration(borderRadius: BorderRadius.all(Radius.circular(4.0))),
        child: Padding(
          padding: const EdgeInsets.only(left: 8, right: 8, top: 4, bottom: 4),
          child: Text(text,
              style: TextStyle(color: color, fontWeight: FontWeight.bold)),
        ),
      ),
    ),
  );
}
