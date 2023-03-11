import 'package:mobile/classes/player/player-data.dart';
import 'package:mobile/classes/rounds/round-data.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-reserve.dart';

class GameUpdateData {
  final PlayerUpdateData? player1;
  final PlayerUpdateData? player2;
  final PlayerUpdateData? player3;
  final PlayerUpdateData? player4;
  final bool? isGameOver;
  final List<String>? winners;
  final List<Square>? board;
  final RoundData? round;
  final List<TileReserveData>? tileReserve;

  GameUpdateData({
    this.player1,
    this.player2,
    this.player3,
    this.player4,
    this.isGameOver,
    this.winners,
    this.board,
    this.round,
    this.tileReserve,
  });

  factory GameUpdateData.fromJson(Map<String, dynamic> json) {
    return GameUpdateData(
        player1:
            PlayerUpdateData.fromJson(json['player1'] as Map<String, dynamic>),
        player2:
            PlayerUpdateData.fromJson(json['player2'] as Map<String, dynamic>),
        player3:
            PlayerUpdateData.fromJson(json['player3'] as Map<String, dynamic>),
        player4:
            PlayerUpdateData.fromJson(json['player4'] as Map<String, dynamic>),
        isGameOver: json['isGameOver'] as bool?,
        winners: List<String>.from(json['winners'] as List),
        board: List<Square>.from(
            (json['board'] as List).map((e) => Square.fromJson(e))),
        round: RoundData.fromJson(json['round'] as Map<String, dynamic>),
        tileReserve: json['tileReserve'] != null &&
                (json['tileReserve'] as List<dynamic>).isNotEmpty
            ? (json['tileReserve'] as List<dynamic>)
                .map((dynamic tile) => TileReserveData.fromJson(tile))
                .toList()
            : List<TileReserveData>.empty());
  }
}
