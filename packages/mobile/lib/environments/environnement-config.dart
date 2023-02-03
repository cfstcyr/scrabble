abstract class BaseConfig {
  String get apiUrl;
  String get webSocketUrl;
  bool get useHttps;
  bool get trackEvents;
  bool get reportErrors;
}

class DevConfig implements BaseConfig {
  String get apiUrl => 'http://10.0.2.2:3000/api';
  String get webSocketUrl => 'http://10.0.2.2:3000/';

  bool get reportErrors => false;

  bool get trackEvents => false;

  bool get useHttps => false;
}

class ProdConfig implements BaseConfig {
  String get apiUrl => 'http://api.scrabble.cfstcyr.com/api';
  String get webSocketUrl => 'http://api.scrabble.cfstcyr.com';

  bool get reportErrors => true;

  bool get trackEvents => true;

  bool get useHttps => true;
}
