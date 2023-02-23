import 'package:mobile/classes/vector.dart';

enum Orientation {
  horizontal,
  vertical,
}

extension OrientationExtension on Orientation {
  Orientation reverse() {
    switch (this) {
      case Orientation.horizontal:
        return Orientation.vertical;
      case Orientation.vertical:
        return Orientation.horizontal;
    }
  }

  Vec2 get vec2 {
    switch (this) {
      case Orientation.horizontal:
        return Vec2.fromRowCol(column: 1, row: 0);
      case Orientation.vertical:
        return Vec2.fromRowCol(column: 0, row: -1);
    }
  }
}