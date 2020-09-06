// @refresh reset
import AsyncStorage from '@react-native-community/async-storage';
import {format, parse} from 'date-fns';
import {BarCodeEvent, BarCodeScanner, PermissionResponse} from 'expo-barcode-scanner';
// @ts-ignore
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
import {BarcodeScannerAppState} from './models/BarcodeScannerAppState';
import {CameraType, ElementProps, StateProps} from './models/ElementProps';
import {LineCount} from './models/LineCount';
import {Sample} from './models/Sample';

const firebaseConfig = {
  apiKey: 'api_key_goes_here',
  authDomain: "uva-covid19-testing-kiosk.firebaseapp.com",
  databaseURL: "https://uva-covid19-testing-kiosk.firebaseio.com",
  projectId: 'project_id_goes_here',
  storageBucket: "uva-covid19-testing-kiosk.appspot.com",
  messagingSenderId: 'sender_id_goes_here',
  appId: 'app_id_goes_here'
};

// Initialize Firebase if not already initialized.
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

YellowBox.ignoreWarnings([
  'Setting a timer for a long period of time',  // Ignore Firebase timer warnings
  'Remote debugger is in a background tab',  // Ignore Firebase timer warnings
]);

const db = firebase.firestore();
const samplesCollection = db.collection('samples');
const countsCollection = db.collection('counts');
const dateFormat = 'yyyyMMddHHmm';

const theme = {
  ...DefaultTheme,
  colors: colors,
}

export default function Main() {
  const [appState, setAppState] = useState<BarcodeScannerAppState>(BarcodeScannerAppState.INITIAL);
  const [sampleId, setSampleId] = useState<string>('');
  const [barCodeId, setBarCodeId] = useState<string>('');
  const [sampleDate, setSampleDate] = useState<Date>(new Date());
  const [locationStr, setLocationStr] = useState<string>('4321');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [cameraType, setCameraType] = useState<CameraType>('back');

  useEffect(() => {
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

    return () => unsubscribeSamples()
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

  const sendDataToFirebase = async (newData: Array<Sample|LineCount>, collection: firebase.firestore.CollectionReference) => {
    const writes = newData.map((s: Sample|LineCount) => collection.doc(s.id).set(s));
    await Promise.all(writes);
  }

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

  const SuccessMessage = (props: ElementProps): ReactElement => {
    return <Title>Your barcode label has printed successfully.</Title>;
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
        // Upload any changes to Firebase
        AsyncStorage.getAllKeys().then(keys => {
          const newSamples = keys
            .filter(s => /^[\d]{9}-[\d]{12}-[\d]{4}$/.test(s))
            .map(s => {
              const propsArray = s.split('-');
              return {
                id: s,
                barcodeId: propsArray[0],
                createdAt: parse(propsArray[1], dateFormat, new Date()),
                locationId: propsArray[2],
              } as Sample;
            });
          sendDataToFirebase(newSamples, samplesCollection).then(_home);
        });

        return <SuccessMessage/>;
      case BarcodeScannerAppState.PRINTING:
        return <View style={styles.container}>
          <PrintingMessage
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
          locationStr={locationStr}
          onSave={(newCameraType: CameraType, newLocationStr: string) => {
            setCameraType(newCameraType);
            setLocationStr(newLocationStr);
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
      <Appbar.Header dark={true}>
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
