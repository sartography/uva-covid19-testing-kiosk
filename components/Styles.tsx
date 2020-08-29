import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  heading: {
    fontSize: 40,
    padding: 40,
  },
  button: {
    backgroundColor: '#f00',
  },
  fullScreen: StyleSheet.absoluteFillObject,
  label: {
    fontSize: 16,
  },
  preview: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  }
});
