import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';

class ClearPlacedTilesWidget extends StatelessWidget {
  ClearPlacedTilesWidget({super.key, required this.hasPlacementStream});

  final Stream<bool> hasPlacementStream;
  final GameEventService _gameEventService = getIt.get<GameEventService>();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<bool>(
      stream: hasPlacementStream,
      builder: (context, snapshot) {
        return AppButton(
          onPressed: snapshot.data ?? false
              ? () {
            _gameEventService.add<void>(
                PUT_BACK_TILES_ON_TILE_RACK, null);
          }
              : null,
          icon: Icons.clear,
          iconOnly: true,
        );
      },
    );
  }
}
