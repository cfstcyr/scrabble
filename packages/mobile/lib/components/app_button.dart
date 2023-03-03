import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';

enum AppButtonTheme {
  primary,
  secondary,
  danger,
  tomato,
  transparent,
}

enum AppButtonSize {
  normal,
  large,
}

class AppButton extends StatelessWidget {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
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
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      height: _getSize(),
      minWidth: _getSize(),
      padding: iconOnly ? EdgeInsets.zero : null,
      child: _getChild(),
    );
  }

  Color _getColor() {
    switch (theme) {
      case AppButtonTheme.primary:
        return _themeColorService.themeColor;
      case AppButtonTheme.danger:
        return Colors.red;
      case AppButtonTheme.tomato:
        return Color.fromRGBO(248, 100, 95, 1);
      case AppButtonTheme.secondary:
        return _themeColorService.secondaryButton;
      case AppButtonTheme.transparent:
        return Colors.transparent;
    }
  }

  Color _getAccentColor() {
    if (onPressed == null) return Colors.white;

    switch (theme) {
      case AppButtonTheme.primary:
      case AppButtonTheme.danger:
      case AppButtonTheme.tomato:
        return Colors.white;
      case AppButtonTheme.secondary:
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

  double _getIconSize() {
    switch (size) {
      case AppButtonSize.normal:
        return 20;
      case AppButtonSize.large:
        return 24;
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
        children.add(Icon(
          icon,
          color: _getAccentColor(),
          size: _getIconSize(),
        ));
      }
      if (text != null && !iconOnly) {
        children.add(Text(
          text!,
          style: TextStyle(
            color: _getAccentColor(),
            fontSize: _getFontSize(),
          ),
        ));
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
