import 'package:flutter/material.dart';

class NoGroupEntry extends StatelessWidget {
  const NoGroupEntry({
    super.key,
    required this.theme,
  });

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return
      Container(
        margin: EdgeInsets.only(bottom: 16),
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: theme.colorScheme.background,
            borderRadius: BorderRadius.all(Radius.circular(8))),
        // padding: EdgeInsets.,
        child: ListTile(
            title: Center(child: Text('Aucune partie disponible'))));
  }
}
