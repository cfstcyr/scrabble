import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/image.dart';
import 'package:mobile/constants/user-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/user.service.dart';

class Avatar extends StatelessWidget {
  final UserService _userService = getIt.get<UserService>();

  /// User avatar url. If null, then avatar from user service will be used.
  final String? avatar;
  final String? initials;
  final double size;
  final double radius;
  final Color? background;

  Avatar(
      {this.avatar,
      required this.size,
      this.initials,
      this.background,
      this.radius = double.maxFinite});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: size,
      width: size,
      child: avatar == null
          ? StreamBuilder<PublicUser?>(
              stream: _userService.user,
              builder: (context, snapshot) => snapshot.hasData
                  ? _getImageAvatar(snapshot.data!.avatar)
                  : _getInitialsAvatar(getUsersInitials(initials ?? '')),
            )
          : _getImageAvatar(avatar!),
    );
  }

  Widget _getImageAvatar(String src) {
    return CircleAvatar(
      radius: radius,
      backgroundImage: AppImage(
        src: src,
        height: size,
        width: size,
      ).provider,
    );
  }

  Widget _getInitialsAvatar(String initials) {
    return CircleAvatar(
      radius: radius,
      backgroundColor: background ?? Colors.grey.shade200,
      child: Text(initials),
    );
  }
}
