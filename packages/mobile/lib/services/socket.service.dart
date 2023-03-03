import 'package:mobile/environments/environment.dart';
import 'package:mobile/services/user-session.service.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../locator.dart';

class SocketService {
  SocketService._privateConstructor();
  static final String webSocketUrl = "${Environment().config.webSocketUrl}";
  final String endpoint = "${Environment().config.apiUrl}/authentification";
  final userSessionHandler = getIt.get<UserSessionService>();
  static final SocketService _instance = SocketService._privateConstructor();
  final IO.Socket socket = IO.io(
      webSocketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket']) // for Flutter or Dart VM
          .disableAutoConnect() // disable auto-connection
          .build());
  factory SocketService() {
    return _instance;
  }

  Future<void> initSocket(String? token) async {
    socket.auth = {"token": token};
    socket.connect();
    socket.onConnect((_) {
      print("${socket.id} + connected to websocket");
    });
    socket.emit("connection");
  }

  void disconnect() {
    socket.disconnect();
  }

  Future<void> emitEvent(String eventName, [dynamic data]) async {
    socket.emit(eventName, data);
  }

  Future<IO.Socket> getSocket() async {
    return socket;
  }
}
