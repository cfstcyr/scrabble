class Tile {
  final String? letter;
  final int? value;
  final bool isWildcard;

  Tile._({
    this.letter,
    this.value,
    this.isWildcard = false
  });

  static Tile wildcard() {
    return Tile._(isWildcard: true);
  }

  static Tile create(String letter, int value) {
    return Tile._(letter: letter, value: value);
  }
}