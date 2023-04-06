import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:rxdart/rxdart.dart';

import '../../classes/user.dart';

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
  UserProfileStatistics({required this.statistics});
  final BehaviorSubject<UserStatistics> statistics;
  @override
  Widget build(BuildContext context) {
    return Card(
        child: Padding(
      padding: EdgeInsets.all(SPACE_3),
      child: StreamBuilder(
          stream: statistics,
          builder: (context, snapshot) => snapshot.hasData
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "CLASSEMENT ELO",
                            value: "${snapshot.data?.rating ?? 0}")),
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
                                "${(snapshot.data?.averagePointsPerGame ?? 0).round()} pts")),
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "Temps moyen",
                            value:
                                "${(snapshot.data?.averageTimePerGame ?? 0).round()} s")),
                  ],
                )
              : snapshot.hasError
                  ? Text('Impossible de charger les statistiques')
                  : Container()),
    ));
  }
}
