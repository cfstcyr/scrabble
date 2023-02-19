enum VirtualPlayerLevel {
  beginner,
  expert
}

extension VirtualPLayerLevelExtension on VirtualPlayerLevel {
  String get level {
    switch (this) {
      case VirtualPlayerLevel.beginner:
        return 'Débutant';
      case VirtualPlayerLevel.expert:
        return 'Expert';
    }
  }
}
