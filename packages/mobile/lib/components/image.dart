import 'package:flutter/material.dart' as c;
import 'package:flutter/widgets.dart';

class AppImage extends c.StatelessWidget {
  final String src;
  final int? height;
  final int? width;

  AppImage({
    required this.src,
    this.height,
    this.width,
  });

  @override
  c.Widget build(c.BuildContext context) {
    return c.Image.network(_getSrc());
  }

  NetworkImage get provider {
    return NetworkImage(_getSrc());
  }

  String _getSrc() {
    return src.startsWith('https://ucarecdn.com/') &&
            (height != null || width != null)
        ? '$src-/resize/${height ?? ''}x${width ?? ''}/'
        : src;
  }
}
