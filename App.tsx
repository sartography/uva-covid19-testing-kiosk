import {BarCodeEvent, BarCodeScanner, PermissionResponse} from 'expo-barcode-scanner';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {CancelButton} from './components/Common';
import {BarCodeDisplay, PrintButton, PrintingMessage} from './components/Print';
import {ScanButton, Scanner} from './components/Scan';
import {styles} from './components/Styles';
import {BarcodeScannerAppState} from './models/BarcodeScannerAppState';
import {ElementProps, StateProps} from './models/ElementProps';

const App = () => {
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

  function Menu(props: StateProps) {
    switch (props.appState) {
      case BarcodeScannerAppState.INITIAL:
        return <LoadingMessage/>;
      case BarcodeScannerAppState.DEFAULT:
        return <ScanButton onClicked={() => setAppState(BarcodeScannerAppState.SCANNING)}/>;
      case BarcodeScannerAppState.PRINTED:
        return <SuccessMessage/>;
      case BarcodeScannerAppState.PRINTING:
        return <PrintingMessage onCancel={() => setAppState(BarcodeScannerAppState.SCANNED)}/>;
      case BarcodeScannerAppState.SCANNED:
        return <View>
          <BarCodeDisplay id={barCodeData} date={date} location={locationStr}/>
          <PrintButton onClicked={() => setAppState(BarcodeScannerAppState.PRINTING)}/>
          <ScanButton onClicked={() => setAppState(BarcodeScannerAppState.SCANNING)}/>
          <CancelButton onClicked={() => setAppState(BarcodeScannerAppState.DEFAULT)}/>
        </View>;
      case BarcodeScannerAppState.SCANNING:
        return <Scanner onScanned={handleBarCodeScanned}/>;
      default:
        return <ErrorMessage/>;
    }
  }

  return (
    <View style={styles.container}>
      <Menu appState={appState}/>
    </View>
  );
};

export default App;
