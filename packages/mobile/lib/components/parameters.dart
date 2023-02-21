import 'package:flutter/material.dart';

import '../view-methods/create-lobby-methods.dart';

class Parameters extends StatelessWidget {
  const Parameters({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 0, right: 0, top: 10.0, bottom: 25.0),
      child: Container(
          child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: EdgeInsets.only(left: 0, right: 25.0, top: 0, bottom: 0),
            child: ElevatedButton.icon(
                onPressed: null,
                style: setStyleButtonToText(),
                icon: Icon(Icons.timer),
                // TODO remove:: pas en cst car ne va plus exister quand on recoit info from backend
                label: Text('1:00')),
          ),
          ElevatedButton.icon(
              onPressed: null,
              style: setStyleButtonToText(),
              icon: Icon(Icons.precision_manufacturing_outlined),
              label: Text('Expert')),
        ],
      )),
    );
  }
}
