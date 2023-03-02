import 'package:mobile/environments/environment.dart';

final String BASE_ENDPOINT = Environment().config.apiUrl;
final String GAME_ENDPOINT = "$BASE_ENDPOINT/games";
final String CHAT_ENDPOINT = "$BASE_ENDPOINT/channel:";
