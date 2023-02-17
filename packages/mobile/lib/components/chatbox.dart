import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:mobile/classes/channel-message.dart';
import 'package:mobile/classes/channel.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/channels.constants.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:uuid/uuid.dart';

import '../classes/chat-message.dart';
import '../controllers/channel.controller.dart';
import '../locator.dart';

class ChatPage extends StatefulWidget {
  final String name;
  ChatPage({super.key, required this.name});

  @override
  State<ChatPage> createState() => _ChatPageState(name: name);
}

class _ChatPageState extends State<ChatPage> {
  late String name;
  _ChatPageState({required this.name}) : assert(name != null);
  List<types.Message> _messages = [];
  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  //TODO: Enlever le chat controller,  Add un Channel Service a la place qui lui parle au controller
  ChannelController channelController = getIt.get<ChannelController>();
  SocketService socketService = getIt.get<SocketService>();
  late PublicUser userData;
  late types.User _user;

  @override
  void initState() {
    super.initState();
    socketService.initSocket();
    channelController.init();
    _listenMessages();
    userData = PublicUser(username: name, avatar: "https://placedog.net/100");
    _user = types.User(id: "UserId", firstName: name, imageUrl: "https://placedog.net/100");
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text("General")),
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
        onMessageLongPress: _onMessageTap,
      ),
    );
  }

  void _addMessage(types.Message message) {
    setState(() {
      _messages.insert(0, message);
    });
  }

  void _onMessageTap(BuildContext context, types.Message message) {
    showDialog<String>(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: Text("Message envoyé à:${getDate(message.createdAt)}"),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.pop(context, 'OK'),
            child: Text("OK"),
          ),
        ],
      ),
    );
  }

  String getDate(int? timestamp) {
    if (timestamp != null) {
      var date = DateTime.fromMillisecondsSinceEpoch(timestamp);
      var formattedDate = "${date.hour}:${date.minute}:${date.second}";
      return formattedDate;
    }
    return "";
  }

  whiteSpace(types.PartialText message) {
    var isWhitespace = message.text.trim().replaceAll(WHITESPACE_REGEX, '').isEmpty;
    var isValid = !isWhitespace;
    return isValid;
  }

  void _handleSendPressed(types.PartialText message) {
    // TODO:  Refactor cette duplication de code, textMessage est utilisé
    // pour l'affichage de store des messages par le package  et messageData pour le event: channel:newMessage

    if (message.text != "" && whiteSpace(message)) {
      final textMessage = types.TextMessage(
        author: _user,
        createdAt: DateTime.now().millisecondsSinceEpoch,
        id: const Uuid().v4(),
        text: message.text,
      );

      final messageData = ChatMessage(
        sender: userData,
        content: message.text,
        date: DateTime.now().toString(),
      );

      _sendMessage(GENERAL_CHANNEL, messageData);
      _addMessage(textMessage);
    }
  }

  void _sendMessage(Channel channel, ChatMessage message) {
    final channelMessage = ChannelMessage(message: message, channel: channel);
    channelController.sendMessage(channelMessage);
  }

  void _handleNewMessage(Map<String, dynamic> message) async {
    //TODO: Distinguer entre les messages renvoyé par le serveur et les messages envoyé par les autres users
    final channelmessage = ChannelMessage.fromJson(message);
    var _sender = types.User(
        id: "",
        imageUrl: channelmessage.message.sender.avatar,
        firstName: channelmessage.message.sender.username,
        createdAt: DateTime.now().millisecondsSinceEpoch);

    final textMessage = types.TextMessage(
      author: _sender,
      createdAt: DateTime.now().millisecondsSinceEpoch,
      id: const Uuid().v4(),
      text: channelmessage.message.content,
    );
    _addMessage(textMessage);
  }

  //TODO:  Add ce listener dans le controller   .
  Future<void> _listenMessages() async {
    socketService.socket.on('channel:newMessage', (channelMessage) {
      _handleNewMessage(channelMessage);
    });
  }

  String generateAvatarUrl() {
    final avatarUrl = "https://placedog.net/${Random().nextInt(1000)}";
    return avatarUrl;
  }
}
