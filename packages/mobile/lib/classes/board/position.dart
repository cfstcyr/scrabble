import 'package:mobile/classes/board/direction.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/vector.dart';

class Position extends Vec2 {

  Position(int column, int row): super.fromRowCol(column: column, row: row);

  Position.fromVec2(Vec2 v): super(v.x, v.y);

  Position forward(Orientation orientation, {int distance = 1}) {
    return move(orientation, Direction.forward, distance: distance);
  }

  Position backward(Orientation orientation, {int distance = 1}) {
    return move(orientation, Direction.backward, distance: distance);
  }

  Position move(Orientation orientation, Direction direction, {int distance = 1}) {
    add(orientation.vec2 * direction.scalar * distance);

    return this;
  }

  Position copy() {
    return Position(x, y);
  }
}