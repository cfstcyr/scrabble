import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/user-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/pages/profile-page.dart';
import 'package:mobile/services/user.service.dart';

import 'chat-management.dart';

class MyScaffold extends StatelessWidget {
  UserService _userService = getIt.get<UserService>();
  final Widget body;
  final String title;

  MyScaffold({required this.body, required this.title});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: body,
      appBar: AppBar(
        title: Text(title),
        shadowColor: Colors.black,
        backgroundColor: Colors.white,
        elevation: 1,
        automaticallyImplyLeading: false,
        centerTitle: true,
        actions: [
          Builder(
            builder: (context) => IconButton(
              icon: Icon(Icons.chat),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
          Builder(
              builder: (context) => InkWell(
                    onTap: () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => ProfilePage()));
                    },
                    child: StreamBuilder<PublicUser?>(
                      stream: _userService.user,
                      builder: (context, snapshot) {
                        return snapshot.data != null
                            ? Padding(
                                padding: EdgeInsets.only(right: SPACE_2),
                                child: getUserAvatar(snapshot.data!.avatar,
                                    height: 48, width: 48),
                              )
                            : Container();
                      },
                    ),
                  )),
        ],
      ),
      endDrawer: Container(width: 325, child: const ChatManagement()),
    );
  }
}
