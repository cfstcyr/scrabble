class Tile {
  final String? letter;
  final int? value;
  final bool isWildcard;
  String? playedLetter;
  TileState _state;

  Tile(
      {this.letter,
      this.value,
      this.isWildcard = false,
      this.playedLetter,
        TileState state = TileState.normal}) : _state = state;

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

  bool get isSelectedForExchange => _state == TileState.selectedForExchange;

  void unselectTile() => _state == TileState.normal;

  void toggleIsSelected() {
    _state = _state == TileState.normal ? TileState.selectedForExchange : TileState.normal;
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

  Tile copy() {
    return Tile(
      value: value,
      letter: letter,
      playedLetter: playedLetter,
      isWildcard: isWildcard
    );
  }
}

enum TileState {
  normal,
  notApplied,
  selectedForExchange,
  synced
}
