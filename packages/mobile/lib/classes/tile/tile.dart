class Tile {
  final String? letter;
  final int? value;
  final bool isWildcard;

  Tile({this.letter, this.value, this.isWildcard = false});

  static Tile wildcard() {
    return Tile(isWildcard: true);
  }

  static Tile create(String letter, int value) {
    return Tile(letter: letter, value: value);
  }
}
