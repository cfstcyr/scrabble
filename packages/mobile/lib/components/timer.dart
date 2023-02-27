import 'package:flutter/widgets.dart';
import 'package:mobile/utils/duration.dart';

class Timer extends StatefulWidget {
  final Duration duration;
  final TextStyle? style;
  final bool stopped;

  Timer({required this.duration, this.style, this.stopped = false});

  @override
  TimerState createState() => TimerState();
}

class TimerState extends State<Timer> with SingleTickerProviderStateMixin {
  late final AnimationController _animationController;

  @override
  void initState() {
    _animationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 500),
    );
    _animationController.repeat(reverse: true);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          minutes(widget.duration),
          style: widget.style,
        ),
        widget.stopped
            ? Text(
                ":",
                style: widget.style,
              )
            : FadeTransition(
                opacity: _animationController,
                child: Text(":", style: widget.style),
              ),
        Text(seconds(widget.duration), style: widget.style),
      ],
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
