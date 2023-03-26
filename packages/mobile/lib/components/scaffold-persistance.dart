import 'package:flutter/material.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/routes/routes.dart';

import 'chat-management.dart';

class MyScaffold extends StatelessWidget {
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
        surfaceTintColor: Colors.white,
        elevation: 1,
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
                    onTap: _canNavigateToProfile(context)
                        ? () {
                            Navigator.pushNamed(context, PROFILE_ROUTE);
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
      endDrawer: Container(width: 325, child: const ChatManagement()),
    );
  }

  bool _canNavigateToProfile(BuildContext context) {
    return ModalRoute.of(context)?.settings.name != PROFILE_ROUTE &&
        ModalRoute.of(context)?.settings.name != PROFILE_EDIT_ROUTE;
  }
}
