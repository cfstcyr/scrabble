// import 'package:mobile/classes/player/player.dart';
// import 'package:mobile/classes/rounds/round-data.dart';
// import 'package:mobile/classes/tile/square.dart';
// import 'package:mobile/classes/tile/tile-reserve.dart';
//
// class GameUpdateData {
//   final PlayerData? player1;
//   final PlayerData? player2;
//   final PlayerData? player3;
//   final PlayerData? player4;
//   final bool? isGameOver;
//   final List<String>? winners;
//   final List<Square>? board;
//   final RoundData? round;
//   final List<TileReserveData>? tileReserve;
//
//   GameUpdateData({
//     this.player1,
//     this.player2,
//     this.player3,
//     this.player4,
//     this.isGameOver,
//     this.winners,
//     this.board,
//     this.round,
//     this.tileReserve,
//   });
//
//   factory GameUpdateData.fromJson(Map<String, dynamic> json) {
//     return GameUpdateData(
//       player1: json['player1'] != null
//           ? PlayerData.fromJson(json['player1'] as Map<String, dynamic>)
//           : null,
//       player2: json['player2'] != null
//           ? PlayerData.fromJson(json['player2'] as Map<String, dynamic>)
//           : null,
//       player3: json['player3'] != null
//           ? PlayerData.fromJson(json['player3'] as Map<String, dynamic>)
//           : null,
//       player4: json['player4'] != null
//           ? PlayerData.fromJson(json['player4'] as Map<String, dynamic>)
//           : null,
//       isGameOver: json['isGameOver'] as bool?,
//       winners: json['winners'] != null
//           ? List<String>.from(json['winners'] as List)
//           : null,
//       board: json['board'] != null
//           ? List<Square>.from(
//               (json['board'] as List).map((e) => Square.fromJson(e)))
//           : null,
//       round: json['round'] != null
//           ? RoundData.fromJson(json['round'] as Map<String, dynamic>)
//           : null,
//       tileReserve: json['tileReserve'] != null
//           ? List<TileReserveData>.from((json['tileReserve'] as List)
//               .map((e) => TileReserveData.fromJson(e)))
//           : null,
//     );
//   }
// }
