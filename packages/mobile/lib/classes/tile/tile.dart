class Tile {
  final String? letter;
  final int? value;
  final bool isWildcard;
  String? playedLetter;

  Tile({this.letter, this.value, this.isWildcard = false, this.playedLetter});

  static Tile wildcard() {
    return Tile(isWildcard: true);
  }

  static Tile create(String letter, int value) {
    return Tile(letter: letter, value: value);
  }

  factory Tile.fromJson(Map<String, dynamic> json) {
    return Tile(
      letter: json['letter'] as String?,
      value: json['value'] as int?,
      isWildcard: json['isWildcard'] as bool? ?? false,
      playedLetter: json['playedLetter'] as String?,
    );
  }

  RackTile toRackTile() {
    return RackTile(letter, value, isWildcard, playedLetter);
  }
}

class RackTile extends Tile {
  bool isSelected;

  RackTile(String? letter, int? value, bool isWildcard, String? playedLetter)
      : isSelected = false,
        super(
            letter: letter,
            value: value,
            isWildcard: isWildcard,
            playedLetter: playedLetter);

  factory RackTile.fromTile(Tile tile) {
    return RackTile(
        tile.letter, tile.value, tile.isWildcard, tile.playedLetter);
  }
}
