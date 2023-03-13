import 'package:rxdart/rxdart.dart';

class EndGameService {
  BehaviorSubject<bool> _isOver$ = BehaviorSubject<bool>.seeded(false);

  EndGameService._privateConstructor();

  static final EndGameService _instance = EndGameService._privateConstructor();

  Stream<bool> get endGameStream => _isOver$.stream;

  factory EndGameService() {
    return _instance;
  }

  void setIsOver(bool value) {
    _isOver$.add(value);
  }
}
