import 'package:flutter/material.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/avatars-constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:rxdart/rxdart.dart';

class AvatarField extends StatelessWidget {
  final Color themeColor =
      getIt.get<ThemeColorService>().themeDetails.value.color.colorValue;
  final BehaviorSubject<String?> avatar;
  final BehaviorSubject<String?> avatarError;

  AvatarField({required this.avatar, required this.avatarError});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<String?>(
        stream: avatar.stream,
        builder: (context, snapshot) {
          return Container(
            alignment: Alignment.center,
            child: Column(children: [
              Wrap(
                  alignment: WrapAlignment.center,
                  spacing: SPACE_1,
                  runSpacing: SPACE_1,
                  children: AVATARS
                      .map((avatarUrl) => Transform.scale(
                            scale: snapshot.data == avatarUrl ? 1.1 : 1,
                            child: Container(
                              decoration: BoxDecoration(
                                border: Border.all(
                                    color: snapshot.data == avatarUrl
                                        ? themeColor
                                        : Colors.transparent,
                                    width: 2),
                                borderRadius:
                                    BorderRadius.all(Radius.circular(28)),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: InkWell(
                                onTap: () {
                                  avatar.add(avatarUrl);
                                },
                                splashColor: Colors.transparent,
                                child: Opacity(
                                  opacity: snapshot.data == avatarUrl ? 1 : 0.8,
                                  child: Avatar(
                                      avatar: avatarUrl, radius: 20, size: 48),
                                ),
                              ),
                            ),
                          ))
                      .toList()),
              StreamBuilder<String?>(
                stream: avatarError.stream,
                builder: (context, snapshot) {
                  return snapshot.data != null
                      ? Container(
                          padding: EdgeInsets.only(top: SPACE_1),
                          child: Text(
                            snapshot.data!,
                            style: TextStyle(color: Colors.red),
                          ),
                        )
                      : Container();
                },
              )
            ]),
          );
        });
  }
}
