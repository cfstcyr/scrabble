import 'package:flutter_dotenv/flutter_dotenv.dart';

abstract class BaseConfig {
  String apiUrl();
  String webSocketUrl();
  bool get useHttps;
  bool get trackEvents;
  bool get reportErrors;
}

class DevConfig implements BaseConfig {
  String defaultPort = "3000";
  
  @override
  String apiUrl() {
    String port = defaultPort;
    if (dotenv.env['SERVER_PORT'] != null) {
      port = dotenv.env['SERVER_PORT']!;
    }
    return 'http://10.0.2.2:$port/api';
  }

  @override
  String webSocketUrl() {
    String port = defaultPort;
    if (dotenv.env['SERVER_PORT'] != null) {
      port = dotenv.env['SERVER_PORT']!;
    }
    return 'http://10.0.2.2:$port';
  }

  @override
  bool get reportErrors => false;

  @override
  bool get trackEvents => false;

  @override
  bool get useHttps => false;
}

class ProdConfig implements BaseConfig {
  @override
  String apiUrl() {
    return 'http://api.scrabble.cfstcyr.com/api';
  }

  @override
  String webSocketUrl() {
    return 'http://api.scrabble.cfstcyr.com';
  }

  @override
  bool get reportErrors => true;

  @override
  bool get trackEvents => true;

  @override
  bool get useHttps => true;
}
