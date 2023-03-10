import 'package:mobile/classes/user.dart';

class ChatMessage {
  final PublicUser sender;
  final String content;
  final String date;

  ChatMessage(
      {required this.sender, required this.content, required this.date});

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      sender: PublicUser.fromJson(json['sender']),
      content: json['content'] as String,
      date: json['date'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        "sender": sender,
        "content": content,
        "date": date,
      };
}
