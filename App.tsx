// @refresh reset
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo, {NetInfoState, NetInfoStateType} from '@react-native-community/netinfo';
import {format, parse} from 'date-fns';
import {BarCodeEvent, BarCodeScanner, PermissionResponse} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import 'firebase/firestore';
import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import {AppRegistry, SafeAreaView, View, YellowBox} from 'react-native';
import {Appbar, DefaultTheme, Provider as PaperProvider, Snackbar, Title,} from 'react-native-paper';
import {expo as appExpo} from './app.json';
import {CancelButton} from './components/Common';
import {InputLineCountButton, InputLineCountScreen} from './components/LineCount';
import {BarCodeDisplay, PrintButton, PrintingMessage} from './components/Print';
import {IdNumberInput, InputIdButton, ScanButton, Scanner} from './components/Scan';
import {SettingsScreen} from './components/Settings';
import {colors, styles} from './components/Styles';
import {sendDataToFirebase, SyncMessage} from './components/Sync';
import {dateFormat, firebaseConfig} from './config/default';
import {BarcodeScannerAppState} from './models/BarcodeScannerAppState';
import {CameraType, ElementProps, StateProps} from './models/ElementProps';
import {LineCount} from './models/LineCount';
import {Sample} from './models/Sample';

// Initialize Firebase if not already initialized.
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

YellowBox.ignoreWarnings([
  'Setting a timer for a long period of time',  // Ignore Firebase timer warnings
  'Remote debugger is in a background tab',     // Ignore remote debugger warnings
]);

const db = firebase.firestore();
const samplesCollection = db.collection('samples');
const countsCollection = db.collection('counts');

const theme = {
  ...DefaultTheme,
  colors: colors,
}

export default function Main() {
  const [appState, setAppState] = useState<BarcodeScannerAppState>(BarcodeScannerAppState.INITIAL);
  const [sampleId, setSampleId] = useState<string>('');
  const [barCodeId, setBarCodeId] = useState<string>('');
  const [sampleDate, setSampleDate] = useState<Date>(new Date());
  const [locationStr, setLocationStr] = useState<string>('0000');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [numCopies, setNumCopies] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const defaultsInitializers = {
    'default.cameraType': (s: string) => setCameraType(s as CameraType),
    'default.numCopies': (s: string) => setNumCopies(parseInt(s, 10)),
    'default.locationStr': (s: string) => setLocationStr(s),
  };

  useEffect(() => {
    AsyncStorage.multiGet(Object.keys(defaultsInitializers)).then(storedDefaults => {
      console.log('storedDefaults', storedDefaults);
      storedDefaults.forEach(d => {
        if (d[1] !== null) {
          // @ts-ignore
          defaultsInitializers[d[0]](d[1]);
        }
      });
    });

    NetInfo.addEventListener((state: NetInfoState) => {
      if (state.type === NetInfoStateType.wifi) {
        setIsConnected(!!(state.isConnected && state.isInternetReachable));
      }
    });

    BarCodeScanner.requestPermissionsAsync().then((value: PermissionResponse) => {
      if (value.granted) {
        setAppState(BarcodeScannerAppState.DEFAULT);
      } else {
        setAppState(BarcodeScannerAppState.ERROR);
      }
    });

    const unsubscribeSamples = samplesCollection.onSnapshot(querySnapshot => {
      // Transform and sort the data returned from Firebase
      const samplesFirestore = querySnapshot
        .docChanges()
        .filter(({type}) => type === 'added')
        .map(({doc}) => {
          const sample = doc.data();
          return {...sample, createdAt: sample.createdAt.toDate()} as Sample;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      appendSamples(samplesFirestore);
    });

    const unsubscribeCounts = countsCollection.onSnapshot(querySnapshot => {
      // Transform and sort the data returned from Firebase
      const lineCountsFirestore = querySnapshot
        .docChanges()
        .filter(({type}) => type === 'added')
        .map(({doc}) => {
          const lineCount = doc.data();
          return {...lineCount, createdAt: lineCount.createdAt.toDate()} as LineCount;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      appendLineCounts(lineCountsFirestore);
    });

    return () => {
      unsubscribeSamples()
      unsubscribeCounts()
    }
  }, []);

  const _doNothing = () => {
  };
  const _scan = () => {
    setErrorMessage('');
    setAppState(BarcodeScannerAppState.SCANNING);
  };
  const _inputIdNumber = () => {
    setErrorMessage('');
    setAppState(BarcodeScannerAppState.INPUT);
  };
  const _inputLineCount = () => {
    setErrorMessage('');
    setAppState(BarcodeScannerAppState.COUNT);
  };
  const _print = () => setAppState(BarcodeScannerAppState.PRINTING);
  const _printed = () => setAppState(BarcodeScannerAppState.PRINTED);
  const _home = () => setAppState(BarcodeScannerAppState.DEFAULT);
  const _settings = () => setAppState(BarcodeScannerAppState.SETTINGS);

  const handleBarCodeScanned = (e: BarCodeEvent) => {
    // Make sure the data is the right length.
    // Scanned barcodes will be exactly 14 digits long.
    // Manually-entered ID numbers will be exactly 9 digits long.
    const barCodeString = e.data;
    const pattern = /^[\d]{14}$|^[\d]{9}$/;
    console.log('barCodeString', barCodeString);
    if (pattern.test(barCodeString)) {
      const cardId = e.data.slice(0, 9);
      const newSampleDate = new Date();
      const newSampleId = [cardId, format(newSampleDate, dateFormat), locationStr].join('-');

      setSampleId(newSampleId);
      setBarCodeId(cardId);
      setSampleDate(newSampleDate);
      setAppState(BarcodeScannerAppState.SCANNED);
    } else {
      setErrorMessage(`The barcode data "${e.data}" is not from a valid ID card.`);
      setAppState(BarcodeScannerAppState.ERROR);
    }
  };

  const handleLineCountSubmitted = (newCount: number) => {
    const now = new Date();
    const newId = `${locationStr}-${format(now, dateFormat)}`;
    const newData: LineCount = {
      id: newId,
      lineCount: newCount,
      locationId: locationStr,
      createdAt: now,
    };
    sendDataToFirebase([newData], countsCollection);
  }

  const appendSamples = useCallback((newSamples) => {
    setSamples((previousSamples) => previousSamples.concat(newSamples));
  }, [samples]);

  const appendLineCounts = useCallback((newLineCounts) => {
    setLineCounts((previousLineCounts) => previousLineCounts.concat(newLineCounts));
  }, [lineCounts]);


  const ErrorMessage = (props: ElementProps): ReactElement => {
    return <View style={styles.fullScreen}>
      <View style={styles.container}>
        <ScanButton onClicked={_scan}/>
        <InputIdButton onClicked={_inputIdNumber}/>
      </View>
      <Snackbar
        visible={appState === BarcodeScannerAppState.ERROR}
        onDismiss={_doNothing}
        style={styles.error}
      >{errorMessage === '' ? 'Something went wrong. Try again.' : errorMessage}</Snackbar>
    </View>
  }

  const LoadingMessage = (props: ElementProps): ReactElement => {
    return <Snackbar
      visible={appState === BarcodeScannerAppState.INITIAL}
      onDismiss={_doNothing}
    >Loading...</Snackbar>;
  }

  const ActionButtons = (props: ElementProps): ReactElement => {
    return <View>
      <PrintButton onClicked={_print}/>
      <CancelButton onClicked={_home}/>
    </View>
  }

  function App(props: StateProps): ReactElement {
    switch (props.appState) {
      case BarcodeScannerAppState.INITIAL:
        return <LoadingMessage/>;
      case BarcodeScannerAppState.DEFAULT:
        return <View style={styles.container}>
          <ScanButton onClicked={_scan}/>
          <InputIdButton onClicked={_inputIdNumber}/>
          <InputLineCountButton onClicked={_inputLineCount}/>
        </View>;
      case BarcodeScannerAppState.PRINTED:
        return <SyncMessage
          isConnected={isConnected}
          samplesCollection={samplesCollection}
          countsCollection={countsCollection}
          onCancel={_home}
          onSync={_home}
        />;
      case BarcodeScannerAppState.PRINTING:
        return <View style={styles.container}>
          <PrintingMessage
            numCopies={numCopies}
            onCancel={_printed}
            id={sampleId}
            barCodeId={barCodeId}
            date={sampleDate}
            location={locationStr}
          />
        </View>;
      case BarcodeScannerAppState.SCANNED:
        return <View style={styles.container}>
          <BarCodeDisplay
            id={sampleId}
            barCodeId={barCodeId}
            date={sampleDate}
            location={locationStr}
          />
          <ActionButtons/>
        </View>;
      case BarcodeScannerAppState.SCANNING:
        return <Scanner
          onScanned={handleBarCodeScanned}
          onCancel={_home}
          cameraType={cameraType}
        />;
      case BarcodeScannerAppState.INPUT:
        return <IdNumberInput
          onScanned={handleBarCodeScanned}
          onCancel={_home}
          cameraType={undefined}
        />;
      case BarcodeScannerAppState.COUNT:
        return <InputLineCountScreen
          onSave={handleLineCountSubmitted}
          onCancel={_home}
        />;
      case BarcodeScannerAppState.SETTINGS:
        return <SettingsScreen
          cameraType={cameraType}
          numCopies={numCopies}
          locationStr={locationStr}
          onSave={(newCameraType: CameraType, newNumCopies: number, newLocationStr: string) => {
            setCameraType(newCameraType);
            setNumCopies(newNumCopies);
            setLocationStr(newLocationStr);

            console.log(newCameraType);
            console.log(newLocationStr);
            console.log(newNumCopies);

            AsyncStorage.multiSet([
              ['default.cameraType', newCameraType as string],
              ['default.locationStr', newLocationStr],
              ['default.numCopies', newNumCopies.toString()],
            ]).then(() => {
              console.log('New defaults stored.');
              AsyncStorage.multiGet(Object.keys(defaultsInitializers)).then(storedDefaults => {
                console.log('stored defaults after saving Settings:', storedDefaults);
              });
            });
            _home();
          }}
          onCancel={_home}
        />;
      default:
        return <ErrorMessage/>;
    }
  }

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header dark={true} style={isConnected ? styles.connected : styles.disconnected}>
        <Appbar.Content title={`${appExpo.description} #${locationStr}`}/>
        <Appbar.Action icon="home" onPress={_home}/>
        <Appbar.Action icon="settings" onPress={_settings}/>
      </Appbar.Header>
      <SafeAreaView style={styles.safeAreaView}>
        <App appState={appState}/>
      </SafeAreaView>
    </PaperProvider>
  );
};

AppRegistry.registerComponent(appExpo.name, () => Main);
