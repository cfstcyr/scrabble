import 'package:flutter/material.dart';

class PlayerView {
  final String username;
  final IconData icon;

  PlayerView({required this.username, this.icon = Icons.person});

  factory PlayerView.fromJson(Map<String, dynamic> json) {
    return PlayerView(
      username: json['username'] as String,
    );
  }

  Map toJson() => {
        'username': username,
      };
}
