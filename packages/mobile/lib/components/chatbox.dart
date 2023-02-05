import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:uuid/uuid.dart';

import '../locator.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  List<types.Message> _messages = [];
  final _user = const types.User(id: "socketId", firstName: "satoshi");
  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  SocketService socketService = getIt.get<SocketService>();
  IO.Socket socket = IO.io('http://localhost:3000', <String, dynamic>{
    'transports': ['websocket'],
    'autoConnect': false,
  });
  @override
  void initState() {
    socketService.initSocket();
    super.initState();
    // _loadMessages();
    _listenMessages();
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text("Main Channel")),
      body: Chat(
        theme: DefaultChatTheme(
          inputBackgroundColor: theme.colorScheme.primary,
          primaryColor: theme.colorScheme.primary,
        ),
        messages: _messages,
        onSendPressed: _handleSendPressed,
        showUserAvatars: true,
        showUserNames: true,
        user: _user,
      ),
    );
  }

  void _addMessage(types.Message message) {
    setState(() {
      _messages.insert(0, message);
    });
  }

  void _handleSendPressed(types.PartialText message) {
    final textMessage = types.TextMessage(
      author: _user,
      createdAt: DateTime.now().millisecondsSinceEpoch,
      id: const Uuid().v4(),
      text: message.text,
      //TODO: Send the message via socket
    );

    _addMessage(textMessage);
  }

  Future<void> _listenMessages() async {
    socket.on('newChat', (message) {
      print(message);
      _addMessage(message);
      setState(() {});
    });
    socket.on('allChats', (messages) {
      print(messages);
      setState(() {
        _addMessage(messages);
      });
    });
  }

  void _sendMessage(String message) {
    print(message);
    if (message != '') {
      socket.emit('newMessage', message);
    }
  }
  // void _loadMessages() async {
  //   final response = await rootBundle.loadString('assets/messages.json');
  //   final messages = (jsonDecode(response) as List)
  //       .map((e) => types.Message.fromJson(e as Map<String, dynamic>))
  //       .toList();

  //   setState(() {
  //     _messages = messages;
  //   });
  // }
}
