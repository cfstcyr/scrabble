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
}
