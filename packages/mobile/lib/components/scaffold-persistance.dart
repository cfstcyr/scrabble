import 'package:flutter/material.dart';
import 'package:mobile/classes/sound.dart';
import 'package:mobile/components/notification-pastille.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/chat.service.dart';
import 'package:mobile/services/sound-service.dart';
import 'package:mobile/services/theme-color-service.dart';

import '../services/user.service.dart';
import 'chat-management.dart';

class MyScaffold extends StatelessWidget {
  final ChatService _chatService = getIt.get<ChatService>();
  final SoundService _soundService = getIt.get<SoundService>();
  final Widget body;
  final String title;
  final Color backgroundColor;
  final bool hasBackButton;
  final bool isLocalProfile;

  MyScaffold(
      {required this.body,
      required this.title,
      this.backgroundColor = Colors.white,
      this.hasBackButton = false,
      this.isLocalProfile = true});

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    Color mainColor =
        getIt.get<ThemeColorService>().themeDetails.value.color.colorValue;
    return Scaffold(
      appBar: AppBar(
        leading: hasBackButton
            ? IconButton(
                icon: Icon(
                  Icons.arrow_back,
                  color: theme.primaryColor,
                ),
                onPressed: () {
                  _soundService.playSound(Sound.click);
                  Navigator.of(context).pop();
                },
              )
            : null,
        automaticallyImplyLeading: false,
        title: Text(title),
        shadowColor: Colors.black,
        backgroundColor: Colors.white,
        surfaceTintColor: theme.colorScheme.primary,
        elevation: 1,
        centerTitle: true,
        actions: [
          _isLocalProfile(context)
              ? Builder(
                  builder: (context) => InkWell(
                        onTap: () {
                          _soundService.playSound(Sound.click);
                          Navigator.pushNamed(context, PROFILE_SEARCH_ROUTE);
                        },
                        child: Icon(Icons.search, color: mainColor, size: 28),
                      ))
              : Container(),
          Builder(
            builder: (context) => StreamBuilder<dynamic>(
                stream: _chatService.hasUnreadMessages,
                builder: (context, snapshot) {
                  Color? pastilleColor;

                  if (snapshot.hasData) {
                    bool hasUnreadMessages = snapshot.data!;

                    pastilleColor =
                        _getNotificationPastilleColor(hasUnreadMessages);
                  }

                  return NotificationPastille(
                      pastilleColor: pastilleColor,
                      child: IconButton(
                        icon: Icon(Icons.chat, color: mainColor),
                        onPressed: () {
                          _soundService.playSound(Sound.click);
                          Scaffold.of(context).openEndDrawer();
                        },
                      ));
                }),
          ),
          Builder(
              builder: (context) => InkWell(
                    onTap: _canNavigateToProfile(context)
                        ? () {
                            _soundService.playSound(Sound.click);
                            Navigator.pushNamed(context, PROFILE_ROUTE,
                                arguments: getIt.get<UserService>().user.value);
                          }
                        : null,
                    child: Padding(
                      padding: EdgeInsets.only(right: SPACE_2),
                      child: Avatar(
                        size: 38,
                      ),
                    ),
                  )),
        ],
      ),
      body: body,
      backgroundColor: backgroundColor,
      endDrawer: Container(width: 325, child: const ChatManagement()),
    );
  }

  bool _canNavigateToProfile(BuildContext context) {
    return ModalRoute.of(context)?.settings.name != PROFILE_ROUTE &&
        ModalRoute.of(context)?.settings.name != PROFILE_EDIT_ROUTE &&
        ModalRoute.of(context)?.settings.name != PROFILE_SEARCH_ROUTE;
  }

  bool _isLocalProfile(BuildContext context) {
    return isLocalProfile &&
        ModalRoute.of(context)?.settings.name == PROFILE_ROUTE;
  }

  Color? _getNotificationPastilleColor(bool hasUnreadMessages) {
    if (hasUnreadMessages) return Colors.red;
    return null;
  }
}
