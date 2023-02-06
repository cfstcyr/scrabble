import 'package:mobile/classes/public-user.dart';

class ChatMessage {
  final PublicUser sender;
  final String content;
  final DateTime date;

  ChatMessage(
      {required this.sender, required this.content, required this.date});

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      sender: json['sender'] as PublicUser,
      content: json['content'] as String,
      date: json['date'] as DateTime,
    );
  }
}
