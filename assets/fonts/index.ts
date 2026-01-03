// Load fonts - using absolute paths to avoid issues with spaces in folder names
const FONTS = {
    'Domine': require('@/assets/fonts/Domine/static/Domine-Regular.ttf'),
    'Domine-Medium': require('@/assets/fonts/Domine/static/Domine-Medium.ttf'),
    'Domine-SemiBold': require('@/assets/fonts/Domine/static/Domine-SemiBold.ttf'),
    'Domine-Bold': require('@/assets/fonts/Domine/static/Domine-Bold.ttf'),
    "Roboto-Mono": require("@/assets/fonts/RobotoMono-Regular.ttf"),
    'Geist': require('@/assets/fonts/Geist/Geist-Regular.ttf'),
    'Geist-Medium': require('@/assets/fonts/Geist/Geist-Medium.ttf'),
    'Geist-Bold': require('@/assets/fonts/Geist/Geist-Bold.ttf'),
    'Geist-Light': require('@/assets/fonts/Geist/Geist-Light.ttf'),
    'Adamina': require('@/assets/fonts/Adamina/Adamina-Regular.ttf'),
    'GoogleSansFlex': require('@/assets/fonts/GoogleSansFlex/GoogleSansFlex-Regular.ttf'),
    // Gentona fonts - folders renamed to remove spaces, but filenames still have spaces
    'Gentona-Bold': require('@/assets/fonts/Gentona/Gentona-Bold/Gentona-Bold.otf'),
    'Gentona-Bold-Italic': require('@/assets/fonts/Gentona/Gentona-Bold-Italic/Gentona-Bold-Italic.otf'),
    'Gentona-Book': require('@/assets/fonts/Gentona/Gentona-Book/Gentona-Book.otf'),
    'Gentona-Book-Italic': require('@/assets/fonts/Gentona/Gentona-Book-Italic/Gentona-Book-Italic.otf'),
    'Gentona-ExtraBold': require('@/assets/fonts/Gentona/Gentona-ExtraBold/Gentona-ExtraBold.otf'),
    'Gentona-ExtraLight-Italic': require('@/assets/fonts/Gentona/Gentona-ExtraLight-Italic/Gentona-ExtraLight-Italic.otf'),
    'Gentona-Medium-Italic': require('@/assets/fonts/Gentona/Gentona-Medium-Italic/Gentona-Medium-Italic.otf'),
  } as const;

export default FONTS;