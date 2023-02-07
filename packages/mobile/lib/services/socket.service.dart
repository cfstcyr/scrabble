import 'package:mobile/environments/environment.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../constants/socket-events.dart';
import '../environments/environnement-config.dart';

class SocketService {
  SocketService._privateConstructor();
  final String webSocketUrl = "${Environment().config.webSocketUrl}";
  static final SocketService _instance = SocketService._privateConstructor();
  final IO.Socket socket = IO.io(, <String, dynamic>{
    'transports': ['websocket'],
    'autoConnect': false,
  });
  factory SocketService() {
    return _instance;
  }

  Future<void> initSocket() async {
    print('Connecting to chat service');

    socket.connect();
    socket.onConnect((_) {
      print('connected to websocket');
    });
    socket.emit("connection");
    print(socket);
  }

  Future<void> emitEvent(String eventName, dynamic data) async {
    socket.emit(eventName, data);
  }
}
