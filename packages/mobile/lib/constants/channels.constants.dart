import '../classes/channel.dart';

Channel GENERAL_CHANNEL = Channel(id: "1", name: "general", canQuit: false);
RegExp WHITESPACE_REGEX = RegExp(
    r'[\u0009\u0020\u00A0\u00AD\u034F\u061C\u0115F\u1160\u1160\u17B4\u17B5\u180E\u205F\u3000\u2800\u3164\uFEFF\uFFA0\u2000-\u200F\u2060-\u206F\uD834\uDD73\uD834\uDD74\uD834\uDD75\uD834\uDD76\uD834\uDD77\uD834\uDD78\uD834\uDD79\uD834\uDD7A]');
const String AVATARS_URL = "https://placedog.net/";
