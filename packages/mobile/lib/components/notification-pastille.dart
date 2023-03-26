import 'package:flutter/material.dart';

class NotificationPastille extends StatelessWidget {
  NotificationPastille({required this.shouldShowPastille, required this.child});

  final bool shouldShowPastille;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      child,
      Visibility(
          visible: shouldShowPastille,
          child: Positioned(
            top: 5,
            right: 5,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                  shape: BoxShape.circle, color: Colors.red),
            ),
          ))
    ]);
  }
}
