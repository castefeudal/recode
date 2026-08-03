# Android Release

Нужны Godot 4.6 templates, Android Studio/SDK, актуальный target API, JDK 17 и keystore. Сгенерируйте ключ `keytool -genkeypair -v -keystore recode-release.keystore -alias recode -keyalg RSA -keysize 4096 -validity 10000`. Секреты храните вне Git. Проверьте Health Connect declaration, Data Safety, adaptive icon, AAB и internal track.
