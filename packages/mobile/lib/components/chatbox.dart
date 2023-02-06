import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:mobile/classes/channel.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:uuid/uuid.dart';

import '../classes/chat-message.dart';
import '../controllers/chat.controller.dart';
import '../locator.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  List<types.Message> _messages = [];

  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  ChatController chatController = getIt.get<ChatController>();
  SocketService socketService = getIt.get<SocketService>();
  // TODO: Set les infos des users avec les vrais infos
  final _user = types.User(id: "UserId", firstName: "satoshi");
  final channel = Channel(id: "id_channel", name: "principal", canQuit: false);
  @override
  void initState() {
    super.initState();
    socketService.initSocket();
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
    // TODO: Refactor cette duplication de code, textMessage est utilisé
    // pour l'affichage de store des messages par le package  et messageData pour le event: channel:newMessage

    final textMessage = types.TextMessage(
      author: _user,
      createdAt: DateTime.now().millisecondsSinceEpoch,
      id: const Uuid().v4(),
      text: message.text,
    );

    // TODO: Enlever le ?? "userTest" quand les infos du user seront bien set , idem pour avatar
    final messageData = ChatMessage(
      sender: PublicUser(
          username: _user.firstName ?? "hardcoded:username",
          avatar: "hardcoded:avatar"),
      content: message.text,
      date: DateTime.now().toString(),
    );

    _sendMessage(channel, messageData);
    _addMessage(textMessage);
  }

  void _sendMessage(Channel channel, ChatMessage message) {
    print(message);
    chatController.sendMessage(channel, message);
  }

  void _handleNewMessage(types.Message message) async {
    _addMessage(message);
    setState(() {});
  }

  //TODO: Add ce listener dans le controller
  Future<void> _listenMessages() async {
    socketService.socket.on('channel:newMessage', (message) {
      _handleNewMessage(message);
      _addMessage(message);
    });
  }
}
