class Tile {
  final String? letter;
  final int? value;
  final bool isWildcard;
  String? playedLetter;
  bool isSelectedForExchange;

  Tile(
      {this.letter,
      this.value,
      this.isWildcard = false,
      this.playedLetter,
      this.isSelectedForExchange = false});

  static Tile wildcard() {
    return Tile(value: 0, letter: '*', isWildcard: true);
  }

  static Tile create(String letter, int value) {
    return Tile(letter: letter, value: value);
  }

  factory Tile.fromJson(Map<String, dynamic> json) {
    return Tile(
      letter: json['letter'] as String?,
      value: json['value'] as int?,
      isWildcard: json['isBlank'] as bool? ?? false,
      playedLetter: json['playedLetter'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'letter': letter,
        'value': value,
        'isBlank': isWildcard,
        'playedLetter': playedLetter,
      };

  void toggleIsSelected() {
    isSelectedForExchange = !isSelectedForExchange;
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Tile &&
          runtimeType == other.runtimeType &&
          letter == other.letter &&
          value == other.value;

  @override
  int get hashCode => letter.hashCode ^ value.hashCode;
}
