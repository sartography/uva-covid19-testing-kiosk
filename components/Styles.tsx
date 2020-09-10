import {StyleSheet} from 'react-native';
import {DarkTheme, DefaultTheme} from 'react-native-paper';

export const colors = {
  ...DarkTheme.colors,
  primary: '#232D4B',
  accent: '#E57200',
  error: '#DF1E43',
  notification: '#E57200',
};

const _common = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 40,
  },
  dark: {
    backgroundColor: colors.primary,
    color: DarkTheme.colors.text,
  },
  light: {
    backgroundColor: DefaultTheme.colors.background,
    color: DefaultTheme.colors.text,
  },
  heading: {
    fontSize: 40,
    padding: 40,
    textAlign: 'center',
  },
});

export const styles = StyleSheet.create({
  captureBox: {
    borderStyle: 'solid',
    borderColor: 'green',
    borderWidth: 10,
    height: '30%',
    width: '90%',
    borderRadius: 20,
  },
  centerMiddle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    ..._common.container,
    ..._common.dark,
  },
  containerDark: {
    ..._common.container,
    ..._common.dark,
  },
  containerLight: {
    ..._common.container,
    ..._common.light,
  },
  containerNoPadding: {
    ..._common.container,
    padding: 0,
  },
  error: {
    backgroundColor: colors.error,
    color: colors.onBackground,
    fontSize: 20,
  },
  subtitle: {
    color: colors.onBackground,
    fontSize: 20,
    padding: 20,
    textAlign: 'center',
  },
  shadow: {
    color: colors.onBackground,
    fontSize: 20,
    marginHorizontal: '15%',
    marginVertical: 40,
    textAlign: 'center',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 4,
    textShadowColor: '#000000',
  },
  heading: {
    ..._common.heading,
    color: colors.onBackground,
  },
  headingInverse: {
    ..._common.heading,
    color: DefaultTheme.colors.text,
  },
  btnLg: {
    fontSize: 20,
    padding: 4,
    margin: 4,
  },
  btnWhite: {
    color: DefaultTheme.colors.text,
    backgroundColor: DefaultTheme.colors.background
  },
  button: {
    color: colors.text,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
  },
  preview: {
    flex: 1,
    backgroundColor: colors.onBackground,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    margin: 20,
    padding: 20,
    borderRadius: 5,
    height: 260,
  },
  printPreview: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    backgroundColor: colors.onBackground,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 20,
    padding: 20,
  },
  surface: {
    ...StyleSheet.absoluteFillObject,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  safeAreaView: {
    flex: 1
  },
  radio: {
    backgroundColor: '#EEEEEE',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settings: {
    // flex: 1,
    // alignItems: 'stretch',
    // flexDirection: 'column',
    // justifyContent: 'center',
    padding: 80,
    backgroundColor: DefaultTheme.colors.background,
    color: DefaultTheme.colors.text,
  },
});
