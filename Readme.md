# wCashless Mobile application

## 1. Clone the project

`git clone git@github.com:wandoOra/wc_forbusiness.git`

`yarn install`


## 2. Build up the native projects

### Android

Please add following permissions to `AndroidManifest.xml` file.

    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    <uses-permission android:name="android.permission.VIBRATE"/>

And add following code to build.gradle for animated GIF support

    implementation 'com.facebook.fresco:animated-gif:2.5.0'
    implementation project(':react-native-splash-screen')
    implementation project(':react-native-vector-icons')

### iOS

Please add FaceId/TouchId, Camera/Gallery permissions to `info.plist`.

    <key>NSFaceIDUsageDescription</key>
    <string>$(PRODUCT_NAME) Authentication with TouchId or FaceID</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>$(PRODUCT_NAME) will select image from gallery for profile.</string>
    <key>NSCameraUsageDescription</key>
    <string>$(PRODUCT_NAME) will take a photo for the profile.</string>

Please including the following lines in the ios/Info.plist file should enable landscape mode for iPad:

    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationLandscapeRight</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
    </array>

## 3. Run the app

### Start metro server
`npx react-native start`
### iOS

`npx react-native run-ios`

### Android

`npx react-native run-android`

## 4. Bug fixing
### Android
node_modules/react-native/index.js : 437 lines:

    get ColorPropType(): $FlowFixMe {
        return require('deprecated-react-native-prop-types').ColorPropType;
    },
    get EdgeInsetsPropType(): $FlowFixMe {
        return require('deprecated-react-native-prop-types').EdgeInsetsPropType;
    },
    get PointPropType(): $FlowFixMe {
        return require('deprecated-react-native-prop-types').PointPropType;
    },
    get ViewPropTypes(): $FlowFixMe {
        return require('deprecated-react-native-prop-types').ViewPropTypes;
    },

node_modules/react-native-leaflet-view/android/gradle.properties : 

    Leaflet_kotlinVersion=1.6.10