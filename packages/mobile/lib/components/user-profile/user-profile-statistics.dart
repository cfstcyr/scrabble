import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';

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

  final UserStatistics? statistics;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
          padding: EdgeInsets.all(SPACE_3),
          child: statistics != null
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "CLASSEMENT ELO",
                            value: "${statistics!.rating.round()}")),
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "PARTIES JOUÉES",
                            value: "${statistics!.gamesPlayedCount}")),
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "PARTIES GAGNÉES",
                            value: "${statistics!.gamesWonCount}")),
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "MOYENNE DE POINTS",
                            value:
                                "${(statistics!.averagePointsPerGame).round()} pts")),
                    Expanded(
                        child: UserProfileStatisticsItem(
                            title: "TEMPS MOYEN",
                            value:
                                "${(statistics!.averageTimePerGame).round()} s")),
                  ],
                )
              : Text('Impossible de charger les statistiques')),
    );
  }
}
