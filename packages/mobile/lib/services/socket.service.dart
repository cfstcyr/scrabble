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
  late final IO.Socket socket;
  factory SocketService() {
    return _instance;
  }

  Future<void> initSocket() async {
    socket = await getSocket();
    socket.onConnect((_) {
      print("${socket.id} + connected to websocket");
    });
    socket.emit("connection");
    socket.onDisconnect((_) => {print("${socket.id}  + disconnected")});
  }

  Future<void> disconnect() async {
    socket.disconnect();
  }

  Future<void> emitEvent(String eventName, [dynamic data]) async {
    socket.emit(eventName, data);
  }

  Future<IO.Socket> getSocket() async {
    return IO.io(webSocketUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {
        'token': userSessionHandler.getToken(),
      }
    });
  }
}

//  private getSocket(): ClientSocket {
//         // This line cannot be tested since it would connect to the real socket in the tests since it is impossible to mock io()
//         return io(environment.serverUrlWebsocket, {
//             transports: ['websocket'],
//             upgrade: false,
//             auth: {
//                 token: authenticationSettings.getToken(),
//             },
//         });
//     }