import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/multiplier.dart';
import 'package:mobile/classes/tile/tile.dart';

class Square {
  Multiplier? multiplier;
  Tile? tile;
  bool isCenter;

  Square({
    this.multiplier,
    this.tile,
    this.isCenter = false,
  });

  Color getColor() {
    return multiplier?.getColor() ?? Colors.transparent;
  }
}
