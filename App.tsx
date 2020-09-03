// @refresh reset
import AsyncStorage from '@react-native-community/async-storage';
import {format, parse} from 'date-fns';
import {BarCodeEvent, BarCodeScanner, PermissionResponse} from 'expo-barcode-scanner';
// @ts-ignore
import * as firebase from 'firebase';
import 'firebase/firestore';
import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import {AppRegistry, SafeAreaView, View, YellowBox} from 'react-native';
import {
  Appbar,
  Button,
  DefaultTheme,
  HelperText,
  Provider as PaperProvider,
  Snackbar,
  Subheading,
  TextInput,
  Title
} from 'react-native-paper';
import {expo as appExpo} from './app.json';
import {CancelButton} from './components/Common';
import {BarCodeDisplay, PrintButton, PrintingMessage} from './components/Print';
import {IdNumberInput, InputIdButton, ScanButton, Scanner} from './components/Scan';
import {colors, styles} from './components/Styles';
import {BarcodeScannerAppState} from './models/BarcodeScannerAppState';
import {ElementProps, StateProps} from './models/ElementProps';
import {Sample} from './models/Sample';

const firebaseConfig = {
  apiKey: "AIzaSyCZHvaAQJKGiU1McxqgbrH-_KPV92JofUA",
  authDomain: "uva-covid19-testing-kiosk.firebaseapp.com",
  databaseURL: "https://uva-covid19-testing-kiosk.firebaseio.com",
  projectId: "uva-covid19-testing-kiosk",
  storageBucket: "uva-covid19-testing-kiosk.appspot.com",
  messagingSenderId: "452622162774",
  appId: "1:452622162774:web:077dc57e8aa59cc5b954f7"
};

// Initialize Firebase if not already initialized.
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

YellowBox.ignoreWarnings([
  'Setting a timer for a long period of time',  // Ignore Firebase timer warnings
]);

const db = firebase.firestore();
const samplesCollection = db.collection('samples');

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

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then((value: PermissionResponse) => {
      if (value.granted) {
        setAppState(BarcodeScannerAppState.DEFAULT);
      } else {
        setAppState(BarcodeScannerAppState.ERROR);
      }
    });

    const unsubscribe = samplesCollection.onSnapshot(querySnapshot => {
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

    return () => unsubscribe()
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
    if (pattern.test(barCodeString)) {
      const cardId = e.data.slice(0, 9);
      const newSampleDate = new Date();
      const newSampleId = [cardId, format(newSampleDate, 'yyyyMMddHHmm'), locationStr].join('-');

      setSampleId(newSampleId);
      setBarCodeId(cardId);
      setSampleDate(newSampleDate);
      setAppState(BarcodeScannerAppState.SCANNED);
    } else {
      setErrorMessage(`The barcode data "${e.data}" is not from a valid ID card.`);
      setAppState(BarcodeScannerAppState.ERROR);
    }
  };

  const appendSamples = useCallback((newSamples) => {
    setSamples((previousSamples) => previousSamples.concat(newSamples));
  }, [samples]);

  const sendDataToFirebase = async (newSamples: Sample[]) => {
    const writes = newSamples.map(s => samplesCollection.doc(s.id).set(s));
    await Promise.all(writes);
  }

  function ErrorMessage(props: ElementProps): ReactElement {
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

  function LoadingMessage(props: ElementProps): ReactElement {
    return <Snackbar
      visible={appState === BarcodeScannerAppState.INITIAL}
      onDismiss={_doNothing}
    >Loading...</Snackbar>;
  }

  function SuccessMessage(props: ElementProps): ReactElement {
    return <Title>Your barcode label has printed successfully.</Title>;
  }

  function ActionButtons(props: ElementProps): ReactElement {
    return <View>
      <PrintButton onClicked={_print}/>
      <CancelButton onClicked={_home}/>
    </View>
  }

  function SettingsScreen(props: ElementProps): ReactElement {
    const [inputStr, setInputStr] = useState<string>(locationStr);
    const pattern = /^[\d]{4}$/;
    const hasErrors = () => {
      return !pattern.test(inputStr);
    };

    return <View style={styles.settings}>
      <Title style={styles.headingInverse}>Settings</Title>
      <View style={{marginBottom: 10}}>
        <Subheading style={{color: DefaultTheme.colors.text, marginBottom: 60}}>
          Please do NOT change this unless you know what you are doing. Entering an incorrect location number may
          prevent patients from getting accurate info about their test results.
        </Subheading>
        <TextInput
          label="Location #"
          value={inputStr}
          onChangeText={inputStr => setInputStr(inputStr)}
          mode="outlined"
          theme={DefaultTheme}
        />
        <HelperText type="error" visible={hasErrors()}>
          Location number must be exactly 4 digits. No other characters are allowed.
        </HelperText>
        <Button
          icon="content-save"
          mode="contained"
          color={colors.primary}
          style={{marginBottom: 10}}
          disabled={hasErrors()}
          onPress={() => {
            setLocationStr(inputStr);
            _home();
          }}
        >Save</Button>
        <Button
          icon="cancel"
          mode="outlined"
          color={colors.primary}
          onPress={_home}
        >Cancel</Button>
      </View>
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
                createdAt: parse(propsArray[1], 'yyyyMMddHHmm', new Date()),
                locationId: propsArray[2],
              } as Sample;
            });
          sendDataToFirebase(newSamples);
        });

        _home();

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
        />;
      case BarcodeScannerAppState.INPUT:
        return <IdNumberInput
          onScanned={handleBarCodeScanned}
          onCancel={_home}
        />;
      case BarcodeScannerAppState.SETTINGS:
        return <SettingsScreen/>;
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
