import 'package:mobile/classes/player/player.dart';
import 'package:mobile/classes/rounds/round-data.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-reserve.dart';

class GameUpdateData {
  final PlayerData? player1;
  final PlayerData? player2;
  final PlayerData? player3;
  final PlayerData? player4;
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
}
