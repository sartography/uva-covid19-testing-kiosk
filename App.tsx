import {BarCodeEvent, BarCodeScanner, PermissionResponse} from 'expo-barcode-scanner';
import React, {useEffect, useState} from 'react';
import {AppRegistry, SafeAreaView, Text, View} from 'react-native';
import {Appbar, DarkTheme, DefaultTheme, Provider as PaperProvider, Surface} from 'react-native-paper';
import {expo as appExpo} from './app.json';
import {CancelButton} from './components/Common';
import {BarCodeDisplay, PrintButton, PrintingMessage} from './components/Print';
import {ScanButton, Scanner} from './components/Scan';
import {colors, styles} from './components/Styles';
import {BarcodeScannerAppState} from './models/BarcodeScannerAppState';
import {ElementProps, StateProps} from './models/ElementProps';

const theme = {
  ...DefaultTheme,
  colors: colors,
}

export default function Main () {
  const [appState, setAppState] = useState<BarcodeScannerAppState>(BarcodeScannerAppState.INITIAL);
  const [barCodeData, setBarCodeData] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [locationStr, setLocationStr] = useState<string>('4321');

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then((value: PermissionResponse) => {
      if (value.granted) {
        setAppState(BarcodeScannerAppState.DEFAULT);
      } else {
        setAppState(BarcodeScannerAppState.ERROR);
      }
    });
  }, []);

  const _scan = () => setAppState(BarcodeScannerAppState.SCANNING);
  const _print = () => setAppState(BarcodeScannerAppState.PRINTING);
  const _home = () => setAppState(BarcodeScannerAppState.DEFAULT);

  const handleBarCodeScanned = (e: BarCodeEvent) => {
    setBarCodeData(e.data);
    setDate(new Date());
    setAppState(BarcodeScannerAppState.SCANNED);
  };

  function ErrorMessage(props: ElementProps) {
    return <Text>Something went wrong.</Text>;
  }

  function LoadingMessage(props: ElementProps) {
    return <Text>Loading...</Text>;
  }

  function SuccessMessage(props: ElementProps) {
    return <Text>Your barcode label has printed successfully.</Text>;
  }

  function ActionButtons(props: ElementProps) {
    return <View style={styles.container}>
      <PrintButton onClicked={_print}/>
      <CancelButton onClicked={_home}/>
    </View>
  }

  function App(props: StateProps) {
    switch (props.appState) {
      case BarcodeScannerAppState.INITIAL:
        return <LoadingMessage/>;
      case BarcodeScannerAppState.DEFAULT:
        return <ScanButton onClicked={_scan}/>;
      case BarcodeScannerAppState.PRINTED:
        return <SuccessMessage/>;
      case BarcodeScannerAppState.PRINTING:
        return <PrintingMessage
          onCancel={_home}
          id={barCodeData}
          date={date} location={locationStr}
        />;
      case BarcodeScannerAppState.SCANNED:
        return <View style={styles.container}>
          <BarCodeDisplay id={barCodeData} date={date} location={locationStr}/>
          <ActionButtons></ActionButtons>
        </View>;
      case BarcodeScannerAppState.SCANNING:
        return <Scanner onScanned={handleBarCodeScanned}/>;
      default:
        return <ErrorMessage/>;
    }
  }

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title={appExpo.name} />
        <Appbar.Action icon="home" onPress={_home} />
        <Appbar.Action icon="camera" onPress={_scan} />
        <Appbar.Action icon="printer" onPress={_print} />
      </Appbar.Header>
      <SafeAreaView style={styles.surface}>
        <App appState={appState}/>
      </SafeAreaView>
    </PaperProvider>
  );
};

AppRegistry.registerComponent(appExpo.name, () => Main);
