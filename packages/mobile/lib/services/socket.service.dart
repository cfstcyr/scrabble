import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../constants/socket-events.dart';

class SocketService {
  SocketService._privateConstructor();
  static final SocketService _instance = SocketService._privateConstructor();
  final IO.Socket socket = IO.io(SERVER_URL, <String, dynamic>{
    'transports': ['websocket'],
    'autoConnect': false,
  });
  factory SocketService() {
    return _instance;
  }

  Future<void> initSocket() async {
    print('Connecting to chat service');

    await socket.connect();
    socket.onConnect((_) {
      print('connected to websocket');
    });
    print(socket);
  }

  Future<void> emitEvent(String eventName, dynamic data) async {
    socket.emit(eventName, data);
  }
}
