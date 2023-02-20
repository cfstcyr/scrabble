import 'package:shared_preferences/shared_preferences.dart';

class StorageHandlerService {
  StorageHandlerService._privateConstructor();
  static final StorageHandlerService _instance =
      StorageHandlerService._privateConstructor();
  factory StorageHandlerService() {
    return _instance;
  }
  static const String _tokenKey = 'token';
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<void> clearStorage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
