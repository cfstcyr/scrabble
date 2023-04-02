import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/game-history.dart';
import 'package:mobile/components/analysis/analysis-request-dialog.dart';
import 'package:mobile/components/table.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/analysis-service.dart';
import 'package:mobile/services/user.service.dart';

import '../../utils/duration.dart';

class UserProfileGameHistory extends StatelessWidget {
  final UserService _userService = getIt.get<UserService>();
  final AnalysisService _analysisService = getIt.get<AnalysisService>();

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
                  ? AppTable(data: snapshot.data!, columns: [
                      AppTableColumn(
                          title: 'Début',
                          builder: (context, row) => Text(
                              DateFormat('d MMMM yyyy, h:mm:ss', 'fr')
                                  .format(row.data.startTime))),
                      AppTableColumn(
                        title: 'Durée',
                        builder: (context, row) => Text(
                            "${minutes(row.data.endTime.difference(row.data.startTime))} m ${seconds(row.data.endTime.difference(row.data.startTime))} s"),
                      ),
                      AppTableColumn(
                          title: 'Résultat',
                          builder: (context, row) => _getGameStatus(row.data)),
                      AppTableColumn(
                          title: 'Score',
                          builder: (context, row) => Text(
                                '${row.data.score} pts',
                              )),
                      AppTableColumn(
                          title: 'Analyse',
                          builder: (context, row) {
                            int? idAnalysis = row.data.idAnalysis;
                            return Row(
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                ElevatedButton(
                                  onPressed: idAnalysis != null
                                      ? () async {
                                          AnalysisRequestDialog(
                                                  title:
                                                      "En attente de l'analyse",
                                                  message:
                                                      "Chargement de l'analyse",
                                                  idAnalysis: idAnalysis,
                                                  requestType:
                                                      AnalysisRequestInfoType
                                                          .idAnalysis)
                                              .openAnalysisRequestDialog(
                                                  context);
                                        }
                                      : null,
                                  style: ElevatedButton.styleFrom(
                                    shape: CircleBorder(),
                                  ),
                                  child: Icon(Icons.science_rounded),
                                ),
                              ],
                            );
                          })
                    ])
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

  Widget _getGameStatus(GameHistory gameHistory) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        ...gameHistory.hasBeenAbandoned
            ? [
                _gameStatus(Colors.grey.shade300, Icons.flag),
                SizedBox(
                  width: SPACE_2,
                  height: 1,
                ),
                Text('Abandonnée'),
              ]
            : gameHistory.isWinner
                ? [
                    _gameStatus(Colors.amber, Icons.emoji_events_rounded),
                    SizedBox(
                      width: SPACE_2,
                      height: 1,
                    ),
                    Text('Gagnée'),
                  ]
                : [
                    _gameStatus(Colors.red, Icons.close,
                        iconColor: Colors.white),
                    SizedBox(
                      width: SPACE_2,
                      height: 1,
                    ),
                    Text('Perdue'),
                  ]
      ],
    );
  }

  Widget _gameStatus(Color color, IconData icon,
      {Color iconColor = Colors.black}) {
    return Container(
      height: 32,
      width: 32,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.all(Radius.circular(30)),
      ),
      child: Icon(
        icon,
        size: 20,
        color: iconColor,
      ),
    );
  }

  Widget _cell(Widget child) {
    return TableCell(
        child: Padding(
      padding: EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_1),
      child: child,
    ));
  }

  Widget _getColumnTitle(String title) {
    return _cell(Text(
      title,
      style:
          TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w500),
    ));
  }
}
