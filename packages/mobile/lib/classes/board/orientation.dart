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
}