import 'package:mobile/environments/environment.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';

class SocketService {
  SocketService._privateConstructor();

  static final String webSocketUrl = Environment().config.webSocketUrl;
  static final SocketService _instance = SocketService._privateConstructor();
  static final IO.Socket socket = io(
      webSocketUrl,
      OptionBuilder()
          .setTransports(['websocket']) // for Flutter or Dart VM
          .disableAutoConnect() // disable auto-connection
          .build());

  factory SocketService() {
    return _instance;
  }

  Future<void> initSocket() async {
    socket.connect();

    socket.onConnect((_) {
      print('connected to websocket');
    });

    socket.onConnectError((err) {
      print(err);
    });
    socket.onConnectTimeout((err) {
      print(err);
    });
    socket.onDisconnect((_) => {print("disconnected")});
  }

  Future<void> emitEvent(String eventName, dynamic data) async {
    socket.emit(eventName, data);
  }

  on<T>(String eventName, dynamic Function(dynamic) handler) {
    socket.on(eventName, handler);
  }
}
