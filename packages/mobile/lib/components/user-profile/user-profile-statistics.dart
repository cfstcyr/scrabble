import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/user.service.dart';

class UserProfileStatisticsItem extends StatelessWidget {
  final String title;
  final String value;

  UserProfileStatisticsItem({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade500),
        ),
        Text(
          value,
          style: TextStyle(fontSize: 48, fontWeight: FontWeight.w800),
        ),
      ],
    );
  }
}

class UserProfileStatistics extends StatelessWidget {
  final UserService _userService = getIt.get<UserService>();

  @override
  Widget build(BuildContext context) {
    return Card(
        child: Padding(
      padding: EdgeInsets.all(SPACE_3),
      child: FutureBuilder(
          future: _userService.getUserStatistics(),
          builder: (context, snapshot) => snapshot.hasData
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "Parties jouées",
                            value: "${snapshot.data?.gamesPlayedCount ?? 0}")),
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "Parties gagnées",
                            value: "${snapshot.data?.gamesWonCount ?? 0}")),
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "Moyenne de points",
                            value:
                                "${(snapshot.data?.averagePointsPerGame ?? 0).round()}")),
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "Temps moyen",
                            value:
                                "${(snapshot.data?.averageTimePerGame ?? 0).round()}")),
                  ],
                )
              : snapshot.hasError
                  ? Text('Impossible de charger les statistiques')
                  : Container()),
    ));
  }
}
