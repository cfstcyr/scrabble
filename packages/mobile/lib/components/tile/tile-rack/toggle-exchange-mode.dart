import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';

class ToggleExchangeModeWidget extends StatelessWidget {
  ToggleExchangeModeWidget({
    super.key,
    required this.tileRack,
  });

  final TileRack tileRack;
  final GameEventService _gameEventService = getIt.get<GameEventService>();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<bool>(
        stream: tileRack.isExchangeModeEnabled,
        builder: (context, snapshot) {
          return ToggleButtons(
              isSelected: [snapshot.data ?? false],
              onPressed: (int index) {
                tileRack.toggleExchangeMode();
                _gameEventService.add<void>(PUT_BACK_TILES_ON_TILE_RACK, null);
              },
              borderRadius: BorderRadius.circular(8),
              constraints: BoxConstraints(
                  maxWidth: 36, maxHeight: 36, minHeight: 36, minWidth: 36),
              fillColor: Theme.of(context).primaryColor,
              selectedColor: Colors.white,
              color: Theme.of(context).primaryColor,
              children: [Icon(Icons.swap_horiz_rounded)]);
        });
  }
}
