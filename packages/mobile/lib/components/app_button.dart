import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';

enum AppButtonTheme {
  primary,
  danger,
  transparent,
}

enum AppButtonSize {
  normal,
  large,
}

class AppButton extends StatelessWidget {
  ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  final Function()? onPressed;
  final AppButtonTheme theme;
  final AppButtonSize size;
  final String? text;
  final IconData? icon;
  final Widget? child;
  final bool iconOnly;

  AppButton({
    required this.onPressed,
    this.theme = AppButtonTheme.primary,
    this.size = AppButtonSize.normal,
    this.text,
    this.icon,
    this.child,
    this.iconOnly = false,
  }) : assert(child != null ? text == null && icon == null : true);

  @override
  Widget build(BuildContext context) {
    return MaterialButton(
      onPressed: onPressed,
      color: _getColor(),
      disabledColor: Colors.grey.shade300,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(iconOnly ? 100 : 8)),
      height: _getSize(),
      minWidth: _getSize(),
      child: _getChild(),
    );
  }

  Color _getColor() {
    switch (theme) {
      case AppButtonTheme.primary:
        return _themeColorService.themeColor;
      case AppButtonTheme.danger:
        return Colors.red;
      case AppButtonTheme.transparent:
        return Colors.transparent;
    }
  }

  Color _getAccentColor() {
    if (onPressed == null) return Colors.white;

    switch (theme) {
      case AppButtonTheme.primary:
      case AppButtonTheme.danger:
        return Colors.white;
      case AppButtonTheme.transparent:
        return Colors.black;
    }
  }

  double _getFontSize() {
    switch (size) {
      case AppButtonSize.normal:
        return 15;
      case AppButtonSize.large:
        return 20;
    }
  }

  double _getSize() {
    switch (size) {
      case AppButtonSize.normal:
        return 36;
      case AppButtonSize.large:
        return 48;
    }
  }

  Widget? _getChild() {
    if (text != null || icon != null) {
      List<Widget> children = [];

      if (icon != null) {
        children.add(
          Icon(icon, color: _getAccentColor(),)
        );
      }
      if (text != null && !iconOnly) {
        children.add(
          Text(
            text!,
            style: TextStyle(
              color: _getAccentColor(),
              fontSize: _getFontSize(),
            ),
          )
        );
      }

      return Wrap(
        spacing: SPACE_2,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: children,
      );
    } else {
      return child;
    }
  }
}