class Tile {
  final String? letter;
  final int? value;
  final bool isWildcard;
  String? playedLetter;
  bool isSelectedForExchange;

  Tile({this.letter, this.value, this.isWildcard = false, this.playedLetter, this.isSelectedForExchange = false});

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
}

