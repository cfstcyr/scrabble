import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';

abstract class AppToggleOption {
  String getName();
}

class AppToggleButton<T extends AppToggleOption, V extends Enum>
    extends StatefulWidget {
  AppToggleButton(
      {required this.defaultValue,
      required this.optionsToValue,
      required this.toggleOptionWidget})
      : _selected$ = BehaviorSubject.seeded(defaultValue);

  final T defaultValue;
  final Map<V, T> optionsToValue;
  final Widget Function(T value) toggleOptionWidget;

  late final BehaviorSubject<T> _selected$;

  Stream<T> get selectedStream => _selected$.stream;

  T? get toggledValue => _selected$.valueOrNull;

  List<V> get toggleOptions => optionsToValue.keys.toList();

  List<T> get toggleValues => optionsToValue.values.toList();

  @override
  State<AppToggleButton> createState() => _AppToggleButtonState<T, V>();
}

class _AppToggleButtonState<T extends AppToggleOption, V extends Enum>
    extends State<AppToggleButton<T, V>> {
  late Stream<List<bool>> _selectedOption;

  @override
  void initState() {
    super.initState();

    _selectedOption =
        widget.selectedStream.switchMap<List<bool>>((T currentSelection) {
      return Stream.value(widget.toggleOptions
          .map<bool>((V option) => option.name == currentSelection.getName())
          .toList());
    });
  }

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return StreamBuilder<List<bool>>(
        stream: _selectedOption,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return SizedBox.shrink();

          return ToggleButtons(
              direction: Axis.horizontal,
              isSelected: snapshot.data!,
              onPressed: (int index) =>
                  widget._selected$.add(widget.toggleValues[index]),
              color: Colors.black,
              selectedColor: Colors.white,
              fillColor: theme.primaryColor,
              children: widget.toggleValues
                  .map((T value) => widget.toggleOptionWidget(value))
                  .toList());
        });
  }
}
