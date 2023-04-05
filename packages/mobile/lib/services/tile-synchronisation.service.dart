import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/controllers/tile-synchronisation-controller.dart';
import 'package:mobile/locator.dart';
import 'package:rxdart/rxdart.dart';

class TileSynchronisationService {
  final TileSynchronisationController _tileSynchronisationController =
      getIt.get<TileSynchronisationController>();

  TileSynchronisationService._privateConstructor() {
    _tileSynchronisationController.synchronisedTiles.listen(
        (List<TilePlacement> tilePlacement) =>
            _synchronisedTiles$.add(tilePlacement));
  }

  final PublishSubject<List<TilePlacement>> _synchronisedTiles$ =
      PublishSubject();

  Stream<List<TilePlacement>> get synchronisedTiles =>
      _synchronisedTiles$.stream;

  static final TileSynchronisationService _instance =
      TileSynchronisationService._privateConstructor();

  factory TileSynchronisationService() {
    return _instance;
  }
}
