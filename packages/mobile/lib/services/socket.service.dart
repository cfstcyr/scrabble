import 'package:mobile/environments/environment.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  SocketService._privateConstructor();
  static final String webSocketUrl = "${Environment().config.webSocketUrl}";
  final String endpoint = "${Environment().config.apiUrl}/authentification";
  static final SocketService _instance = SocketService._privateConstructor();
  final IO.Socket socket = IO.io(webSocketUrl, <String, dynamic>{
    'transports': ['websocket'],
    'autoConnect': false,
  });
  factory SocketService() {
    return _instance;
  }

  Future<void> initSocket() async {
    socket.connect();
    socket.onConnect((_) {
      print("${socket.id} + connected to websocket");
    });
    socket.emit("connection");
    socket.onDisconnect((_) => {print("${socket.id}  + disconnected")});
  }

  Future<void> emitEvent(String eventName, [dynamic data]) async {
    socket.emit(eventName, data);
  }
}
