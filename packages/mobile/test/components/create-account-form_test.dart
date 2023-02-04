import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/components/create-account-form.dart';
import 'package:mobile/constants/create-account-constants.dart';
import 'package:mobile/services/account-authentification-service.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:provider/provider.dart';

import 'create-account-form_test.mocks.dart';

void emptyFunction() {}

final GetIt getIt = GetIt.instance;

@GenerateMocks([TextFieldHandler, ThemeColorService, AccountAuthenticationService])
void main() {
  group('CreateAccountForm', () {
    late CreateAccountForm createAccountForm;
    late CreateAccountFormState createAccountFormState;
    late MockThemeColorService mockThemeColorService;
    late MockAccountAuthenticationService mockAccountAuthenticationService;
    mockThemeColorService = MockThemeColorService();
    mockAccountAuthenticationService = MockAccountAuthenticationService();
    getIt.registerLazySingleton<AccountAuthenticationService>(() => mockAccountAuthenticationService);
    getIt.registerLazySingleton<ThemeColorService>(() => mockThemeColorService);
    setUp(() async {
      createAccountForm = CreateAccountForm();

      when(mockThemeColorService.themeColor).thenReturn(Colors.black);
      createAccountFormState = await createAccountForm.createState();
    });

    Widget createWidgetUnderTest() {
      return MaterialApp(
          title: 'News App',
          home: Scaffold(
            body: createAccountForm,
          ));
    }

    tearDown(() {
      // createAccountFormState.dispose();
    });

    testWidgets('build', (WidgetTester tester) async {
      await tester.pumpWidget(
        Builder(
          builder: (BuildContext context) {
            Widget widget = createAccountFormState.build(context);

            expect(widget, isNotNull);

            // The builder function must return a widget.
            return Placeholder();
          },
        ),
      );
    });

    test('initState', () {
      createAccountFormState.initState();
      expect(createAccountFormState.emailHandler.focusNode.hasListeners, isTrue);
      expect(createAccountFormState.usernameHandler.focusNode.hasListeners, isTrue);
      expect(createAccountFormState.passwordHandler.focusNode.hasListeners, isTrue);
      expect(createAccountFormState.passwordMatchHandler.focusNode.hasListeners, isTrue);
    });

    test('isFormValid', () {
      createAccountFormState.emailHandler.controller.text = "aa";
      createAccountFormState.usernameHandler.controller.text = "aa";
      createAccountFormState.passwordHandler.controller.text = "aa";
      createAccountFormState.passwordMatchHandler.controller.text = "aa";

      expect(createAccountFormState.isFormValid(), isTrue);
    });

    // group('validatePassword', () {
    //   test('invalid format (Numbers)', () {
    //     createAccountFormState.passwordHandler.controller.text = "missingNumbers!";
    //     createAccountFormState.validatePassword();
    //     expect(createAccountFormState.passwordHandler.errorMessage, PASSWORD_INVALID_FORMAT_FR);
    //   });

    //   testWidgets(
    //     "title is displayed",
    //     (WidgetTester tester) async {
    //       await tester.pumpWidget(createWidgetUnderTest());
    //       createAccountFormState.passwordHandler.controller.text = "missingNumbers!";
    //       createAccountFormState.validatePassword();
    //       expect(createAccountFormState.passwordHandler.errorMessage, PASSWORD_INVALID_FORMAT_FR);
    //     },
    //   );

    //   test('invalid format (length)', () {
    //     createAccountFormState.passwordHandler.controller.text = "aA1!";
    //     createAccountFormState.validatePassword();
    //     expect(createAccountFormState.passwordHandler.errorMessage, PASSWORD_INVALID_FORMAT_FR);
    //   });

    //   test('valid format ', () {
    //     createAccountFormState.passwordHandler.controller.text = "aaaaA1222!";
    //     createAccountFormState.validatePassword();
    //     expect(createAccountFormState.passwordHandler.errorMessage, isEmpty);
    //   });
    // });

    // group('validatePasswordMatch', () {
    //   test('NotMatching', () {
    //     createAccountFormState.passwordMatchHandler.controller.text = "aA1!aA1!aA1!";
    //     createAccountFormState.passwordHandler.controller.text = "aA1!aA1!aA1!aa!";
    //     createAccountFormState.validatePasswordMatch();
    //     expect(createAccountFormState.passwordHandler.errorMessage, PASSWORD_NOT_MATCHING_FR);
    //   });

    //   test('Matching', () {
    //     createAccountFormState.passwordHandler.controller.text = "aA1!aA1!aA1!";
    //     createAccountFormState.passwordMatchHandler.controller.text = "aA1!aA1!aA1!";
    //     createAccountFormState.validatePasswordMatch();
    //     expect(createAccountFormState.passwordHandler.errorMessage, isEmpty);
    //   });
    // });
  });
}
