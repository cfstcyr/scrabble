import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/multiplier.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:rxdart/rxdart.dart';

class Square {
  Multiplier? multiplier;
  bool isCenter;
  BehaviorSubject<Tile?> _tile;
  BehaviorSubject<bool> _isApplied;

  Square({
    this.multiplier,
    this.isCenter = false,
    Tile? tile,
    bool isApplied = false,
  })  : _tile = BehaviorSubject.seeded(tile),
        _isApplied = BehaviorSubject.seeded(isApplied);

  Color getColor() {
    return multiplier?.getColor() ?? Colors.transparent;
  }

  ValueStream<Tile?> get tile {
    return _tile.stream;
  }

  Stream<bool> hasTile() {
    return _tile.map((tile) => tile != null);
  }

  ValueStream<bool> get isAppliedStream {
    return _isApplied.stream;
  }

  bool getIsApplied() {
    return _isApplied.value;
  }

  Square setTile(Tile tile) {
    _tile.add(tile);
    return this;
  }

  Tile? getTile() {
    return _tile.value;
  }

  Square applyTile() {
    _isApplied.add(true);
    return this;
  }

  Square removeTile() {
    _tile.add(null);
    return this;
  }
}
