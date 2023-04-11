import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';

enum AppButtonTheme {
  primary,
  secondary,
  danger,
  tomato,
  tertiary,
}

enum AppButtonSize {
  normal,
  large,
  extraLarge,
}

enum AppButtonType {
  normal,
  ghost,
}

class AppButton extends StatelessWidget {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  final Function()? onPressed;
  final AppButtonTheme theme;
  final AppButtonSize size;
  final AppButtonType type;
  final String? text;
  final IconData? icon;
  final Widget? child;
  final bool iconOnly;

  AppButton({
    required this.onPressed,
    this.theme = AppButtonTheme.primary,
    this.size = AppButtonSize.normal,
    this.type = AppButtonType.normal,
    this.text,
    this.icon,
    this.child,
    this.iconOnly = false,
  }) : assert(child != null ? text == null && icon == null : true);

  @override
  Widget build(BuildContext context) {
    return MaterialButton(
      onPressed: onPressed,
      color: _getButtonColor(),
      disabledColor: type == AppButtonType.normal
          ? Colors.grey.shade300
          : Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(3)),
      height: _getSize(),
      minWidth: _getSize(),
      padding: iconOnly ? EdgeInsets.zero : null,
      elevation: type == AppButtonType.normal ? 1 : 0,
      focusElevation: type == AppButtonType.normal ? 4 : 0,
      hoverElevation: type == AppButtonType.normal ? 4 : 0,
      highlightElevation: type == AppButtonType.normal ? 8 : 0,
      child: _getChild(),
    );
  }

  Color _getButtonColor() {
    return type == AppButtonType.ghost ? Colors.transparent : _getColor();
  }

  Color _getColor() {
    switch (theme) {
      case AppButtonTheme.primary:
        return _themeColorService.themeDetails.value.color.colorValue;
      case AppButtonTheme.danger:
        return Colors.red;
      case AppButtonTheme.tomato:
        return Color.fromRGBO(248, 100, 95, 1);
      case AppButtonTheme.tertiary:
        return _themeColorService.menuSecondaryButton;
      case AppButtonTheme.secondary:
        return type == AppButtonType.ghost
            ? Colors.black
            : _themeColorService.secondaryButton;
    }
  }

  Color _getAccentColor() {
    if (onPressed == null) {
      return type == AppButtonType.normal
          ? Colors.white
          : _getColor().withAlpha(100);
    }

    switch (theme) {
      case AppButtonTheme.primary:
      case AppButtonTheme.danger:
      case AppButtonTheme.tomato:
        return Colors.white;
      case AppButtonTheme.tertiary:
      case AppButtonTheme.secondary:
        return Colors.black;
    }
  }

  double _getFontSize() {
    switch (size) {
      case AppButtonSize.normal:
        return 15;
      case AppButtonSize.large:
        return 20;
      case AppButtonSize.extraLarge:
        return 25;
    }
  }

  double _getIconSize() {
    switch (size) {
      case AppButtonSize.normal:
        return 20;
      case AppButtonSize.large:
        return 24;
      case AppButtonSize.extraLarge:
        return 32;
    }
  }

  double _getSize() {
    switch (size) {
      case AppButtonSize.normal:
        return 36;
      case AppButtonSize.large:
        return 48;
      case AppButtonSize.extraLarge:
        return 72;
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

AppButton defaultCloseButton(
    {required BuildContext context, required AppButtonSize size}) {
  return AppButton(
      onPressed: () => Navigator.pop(context),
      text: 'Fermer',
      size: size,
      theme: AppButtonTheme.secondary);
}
