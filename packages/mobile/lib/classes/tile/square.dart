import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/multiplier.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:rxdart/rxdart.dart';

class Square {
  Multiplier? multiplier;
  bool isCenter;
  BehaviorSubject<Tile?> _tile;

  Square({
    this.multiplier,
    this.isCenter = false,
    Tile? tile,
  }) : _tile = BehaviorSubject.seeded(tile);

  Color getColor() {
    return multiplier?.getColor() ?? Colors.transparent;
  }

  ValueStream<Tile?> get tile {
    return _tile.stream;
  }

  Stream<bool> hasTile() {
    return _tile.map((tile) => tile != null);
  }

  setTile(Tile tile) {
    _tile.add(tile);
  }
}
