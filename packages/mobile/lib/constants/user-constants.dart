import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/classes/virtual-player-level.dart';

PublicUser generateVirtualPlayerUser(VirtualPlayerLevel virtualPlayerLevel) =>
    PublicUser(username: 'JV ${virtualPlayerLevel.levelName}', avatar: '');

String getUsersInitials(String username) {
  if (username.isEmpty || username.trim().isEmpty) return '?';
  List<String> uppercaseLetters = username
      .replaceAll(
          RegExp(
              r'[^a-zA-Z\dŠšŽžÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìiíiîiïiñòóôõöùúûýÿ]'),
          '')
      .characters
      .where((String letter) => letter.toUpperCase() == letter)
      .toList();
  return uppercaseLetters.isEmpty
      ? username.trim()[0].toUpperCase()
      : uppercaseLetters.take(2).join();
}
