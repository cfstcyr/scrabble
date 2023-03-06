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
import '../controllers/channel.controller.dart';
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
  //TODO: Enlever le chat controller,  Add un Channel Service a la place qui lui parle au controller
  ChannelController channelController = getIt.get<ChannelController>();
  ChannelService channelService = getIt.get<ChannelService>();
  UserService userService = getIt.get<UserService>();
  // TODO: Set les infos des users avec les vrais infos
  late PublicUser userData;
  late final _user;
  BehaviorSubject<List<ChannelMessage>> get messages$ =>
      channelService.messages$;

  @override
  void initState() {
    super.initState();
    userData = userService.getUser();
    _user = types.User(id: userData.email, firstName: userData.username);
    messages$.add(widget.channel.messages);
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
    return StreamBuilder(
        stream: channelService.messages$.stream,
        builder: (context, snapshot) {
          // update the channel history
          widget.channel.messages = messages$.value;

          return Chat(
            theme: DefaultChatTheme(
              inputBackgroundColor: theme.colorScheme.primary,
              primaryColor: theme.colorScheme.primary,
            ),
            messages: filterToChatBoxFormat(messages$.value),
            onSendPressed: _handleSendPressed,
            showUserAvatars: true,
            showUserNames: true,
            user: _user,
          );
        });
  }

  void _handleSendPressed(types.PartialText message) {
    // TODO: Refactor cette duplication de code, textMessage est utilisé
    // pour l'affichage de store des messages par le package  et messageData pour le event: channel:newMessage
    if (message.text != "") {
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

      final channelMessage = ChannelMessage(
          message: messageData, idChannel: widget.channel.idChannel);

      _sendMessage(widget.channel, messageData);
      _addMessage(channelMessage);
    }
  }

  void _addMessage(ChannelMessage message) {
    List<ChannelMessage> channelMessages = [...messages$.value];
    channelMessages.insert(0, message);
    messages$.add([...channelMessages]);
  }

  void _sendMessage(Channel channel, ChatMessage message) {
    channelController.sendMessage(channel, message);
  }

  types.TextMessage toChatBoxFormat(ChatMessage message) {
    return types.TextMessage(
      author: types.User(
          id: message.sender.email, firstName: message.sender.username),
      createdAt: DateTime.parse(message.date).millisecondsSinceEpoch,
      id: const Uuid().v4(),
      text: message.content,
    );
  }

  List<types.TextMessage> filterToChatBoxFormat(List<ChannelMessage> messages) {
    return List<types.TextMessage>.from(
        messages.map((message) => toChatBoxFormat(message.message)));
  }
}
