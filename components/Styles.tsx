import {StyleSheet} from 'react-native';
import {DarkTheme} from 'react-native-paper';


export const colors = {
  ...DarkTheme.colors,
  primary: '#232D4B',
  accent: '#E57200',
  error: '#DF1E43',
  notification: '#E57200',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  heading: {
    color: colors.onBackground,
    fontSize: 40,
    padding: 40,
    textAlign: 'center',
  },
  btnLg: {
    fontSize: 20,
    padding: 4,
    margin: 4,
  },
  button: {
    color: colors.text,
  },
  fullScreen: StyleSheet.absoluteFillObject,
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
  }
});
