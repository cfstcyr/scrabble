enum Direction {
  forward,
  backward,
}

extension DirectionExtension on Direction {
  int get value {
    switch (this) {
      case Direction.forward:
        return 1;
      case Direction.backward:
        return -1;
    }
  }
}