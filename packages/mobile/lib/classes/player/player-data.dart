import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/classes/user.dart';

class PlayerData {
  String id;
  String? newId;
  PublicUser? publicUser;
  int? score;
  List<Tile>? tiles;

  PlayerData({
    required this.id,
    this.newId,
    this.publicUser,
    this.score,
    this.tiles,
  });

  factory PlayerData.fromJson(Map<String, dynamic> json) {
    return PlayerData(
      id: json['id'] as String,
      newId: json['newId'] as String?,
      publicUser: json['publicUser'] != null
          ? PublicUser.fromJson(json['publicUser'] as Map<String, dynamic>)
          : null,
      score: json['score'] as int?,
      tiles: json['tiles'] != null
          ? List<Tile>.from(
              (json['tiles'] as List).map((e) => Tile.fromJson(e)))
          : null,
    );
  }
}
