import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/theme-color-service.dart';
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
  @override
  void initState() {
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
    socketService.socket.on('channel:newMessage', (message) {
      _handleNewMessage(message);
    });
    socketService.socket.on('allChats', (messages) {
      print(messages);
      setState(() {
        _addMessage(messages);
      });
    });
  }

  void _sendMessage(String message) {
    socketService.sendMessage(message);
  }

  void _handleNewMessage(types.Message message) async {
    print(message);
    _addMessage(message);
    setState(() {});
  }
}
