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
}
