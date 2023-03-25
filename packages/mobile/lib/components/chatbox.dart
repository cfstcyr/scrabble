import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:mobile/classes/channel.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:rxdart/rxdart.dart';
import 'package:uuid/uuid.dart';

import '../classes/channel-message.dart';
import '../classes/chat-message.dart';
import '../locator.dart';
import '../services/channel.service.dart';
import '../services/user.service.dart';

class ChatPage extends StatefulWidget {
  final Channel channel;
  const ChatPage({super.key, required this.channel});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  List<types.Message> _messages = [];

  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  ChannelService channelService = getIt.get<ChannelService>();
  UserService userService = getIt.get<UserService>();
  late PublicUser userData;
  late types.User _userView;

  @override
  void initState() {
    super.initState();
    userData = userService.getUser();
    _userView = types.User(id: userData.email, firstName: userData.username);
    channelService.addMessages(widget.channel.messages);
    _messages = filterToChatBoxFormat(widget.channel.messages);
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(widget.channel.name)),
      body: handleChannelChange(theme),
    );
  }

  StreamBuilder handleChannelChange(ThemeData theme) {
    return StreamBuilder<List<ChannelMessage>?>(
        stream: channelService.messagesStream,
        builder: (context, snapshot) {
          // update the channel history
          widget.channel.messages = snapshot.data ?? List.empty();

          return Chat(
            theme: DefaultChatTheme(
              inputBackgroundColor: theme.colorScheme.primary,
              primaryColor: theme.colorScheme.primary,
            ),
            messages: filterToChatBoxFormat(widget.channel.messages),
            onSendPressed: _handleSendPressed,
            showUserAvatars: true,
            showUserNames: true,
            user: _userView,
          );
        });
  }

  void _handleSendPressed(types.PartialText message) {
    if (message.text != "") {
      final messageData = ChatMessage(
        sender: userData,
        content: message.text,
        date: DateTime.now().toString(),
      );

      final channelMessage = ChannelMessage(
          message: messageData, idChannel: widget.channel.idChannel);

      channelService.sendMessage(widget.channel, messageData);
    }
  }

  types.TextMessage toChatBoxFormat(ChatMessage message) {
    return types.TextMessage(
      author: types.User(
          id: message.sender.email, firstName: message.sender.username),
      createdAt: DateTime.parse(message.date).millisecondsSinceEpoch,
      id: message.uid,
      text: message.content,
    );
  }

  List<types.TextMessage> filterToChatBoxFormat(List<ChannelMessage> messages) {
    return List<types.TextMessage>.from(
        messages.map((message) => toChatBoxFormat(message.message)));
  }
}
