// @refresh reset
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo, {NetInfoState, NetInfoStateType} from '@react-native-community/netinfo';
import {format} from 'date-fns';
import {BarCodeEvent, BarCodeScanner, PermissionResponse} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import 'firebase/firestore';
import React, {ReactElement, useEffect, useState} from 'react';
import {AppRegistry, SafeAreaView, View, YellowBox} from 'react-native';
import {Appbar, Provider as PaperProvider, Snackbar,} from 'react-native-paper';
import {expo as appExpo} from './app.json';
import {CancelButton} from './components/Common';
import {InputLineCountButton, InputLineCountScreen} from './components/LineCount';
import {BarCodeDisplay, PrintButton, PrintingMessage} from './components/Print';
import {IdNumberInput, InitialsInput, InputIdButton, ScanButton, Scanner} from './components/Scan';
import {SettingsScreen} from './components/Settings';
import {styles, theme} from './components/Styles';
import {SyncMessage} from './components/Sync';
import {defaults, firebaseConfig} from './config/default';
import {BarcodeScannerAppState} from './models/BarcodeScannerAppState';
import {CameraType, ElementProps, StateProps} from './models/ElementProps';
import {LineCount} from './models/LineCount';
import {Sample} from './models/Sample';

YellowBox.ignoreWarnings([
  'Setting a timer for a long period of time',  // Ignore Firebase timer warnings
  'Remote debugger is in a background tab',     // Ignore remote debugger warnings
]);

// Initialize Firebase if not already initialized.
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const samplesCollection = db.collection(defaults.samplesCollection);
const countsCollection = db.collection(defaults.countsCollection);

export default function Main() {
  const [appState, setAppState] = useState<BarcodeScannerAppState>(BarcodeScannerAppState.INITIAL);
  const [sampleId, setSampleId] = useState<string>('');
  const [barCodeId, setBarCodeId] = useState<string>('');
  const [sampleDate, setSampleDate] = useState<Date>(new Date());
  const [locationStr, setLocationStr] = useState<string>(defaults.locationId);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [lineCounts, setLineCounts] = useState<LineCount[]>([]);
  const [cameraType, setCameraType] = useState<CameraType>(defaults.cameraType);
  const [numCopies, setNumCopies] = useState<number>(defaults.numCopies);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [initials, setInitials] = useState<string>('');

  const defaultsInitializers = {
    'default.cameraType': (s: string) => setCameraType(s as CameraType),
    'default.numCopies': (s: string) => setNumCopies(parseInt(s, 10)),
    'default.locationStr': (s: string) => setLocationStr(s),
  };

  useEffect(() => {

    // Retrieve previous stored settings, if they exist.
    AsyncStorage.multiGet(Object.keys(defaultsInitializers)).then(storedDefaults => {
      storedDefaults.forEach(d => {
        if (d[1] !== null) {
          // @ts-ignore
          defaultsInitializers[d[0]](d[1]);
        }
      });
    });

    // Watch for changes to internet connectivity.
    // TODO: Set up a timer that periodically syncs data with the database if connected.
    NetInfo.addEventListener((state: NetInfoState) => {
      if (state.type === NetInfoStateType.wifi) {
        setIsConnected(!!(state.isConnected && state.isInternetReachable));
      }
    });

    // Ask for permission to use the camera.
    BarCodeScanner.requestPermissionsAsync().then((value: PermissionResponse) => {
      if (value.granted) {
        setAppState(BarcodeScannerAppState.DEFAULT);
      } else {
        setAppState(BarcodeScannerAppState.ERROR);
      }
    });
  }, []);

  // State event handlers
  const _doNothing = () => {
  };
  const _scan = () => {
    setErrorMessage('');
    setAppState(BarcodeScannerAppState.SCANNING);
  };
  const _inputIdNumber = () => {
    setErrorMessage('');
    setAppState(BarcodeScannerAppState.INPUT_ID);
  };
  const _inputLineCount = () => {
    setErrorMessage('');
    setAppState(BarcodeScannerAppState.INPUT_LINE_COUNT);
  };
  const _print = () => setAppState(BarcodeScannerAppState.PRINTING);
  const _sync = () => setAppState(BarcodeScannerAppState.SYNC);
  const _home = () => setAppState(BarcodeScannerAppState.DEFAULT);
  const _settings = () => setAppState(BarcodeScannerAppState.SETTINGS);

  const handleBarCodeScanned = (e: BarCodeEvent) => {
    // Make sure the data is the right length.
    const barCodeString = e.data;
    if (defaults.barCodeRegex.test(barCodeString)) {
      const cardId = e.data.slice(0, defaults.barCodeNumLength);
      const newSampleDate = new Date();
      setBarCodeId(cardId);
      setSampleDate(newSampleDate);
      setAppState(BarcodeScannerAppState.INPUT_INITIALS);
    } else {
      setErrorMessage(`The barcode data "${e.data}" is not from a valid ID card.`);
      setAppState(BarcodeScannerAppState.ERROR);
    }
  };

  const handleInitialsInput = (newInitials: string) => {
    setInitials(newInitials);
    const newSampleId = [barCodeId, newInitials, format(sampleDate, defaults.dateEncodedFormat), locationStr].join('-');
    setSampleId(newSampleId);
    setAppState(BarcodeScannerAppState.SCANNED);
  };

  const handleLineCountSubmitted = (newCount: number) => {
    const now = new Date();
    const newId = `${locationStr}-${format(now, defaults.dateEncodedFormat)}`;
    const newData: LineCount = {
      id: newId,
      lineCount: newCount,
      locationId: locationStr,
      createdAt: now,
    };

    AsyncStorage.setItem(newData.id, JSON.stringify(newData)).then(_sync);
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

  const ActionButtons = (props: ElementProps): ReactElement => {
    return <View>
      <PrintButton onClicked={_print}/>
      <CancelButton onClicked={_home}/>
    </View>
  }

  const AppContent = (props: StateProps): ReactElement => {
    switch (props.appState) {
      case BarcodeScannerAppState.INITIAL:
        return <LoadingMessage/>;
      case BarcodeScannerAppState.DEFAULT:
        return <View style={styles.container}>
          <ScanButton onClicked={_scan}/>
          <InputIdButton onClicked={_inputIdNumber}/>
          <InputLineCountButton onClicked={_inputLineCount}/>
        </View>;
      case BarcodeScannerAppState.SYNC:
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
            onCancel={_sync}
            id={sampleId}
            barCodeId={barCodeId}
            date={sampleDate}
            location={locationStr}
            initials={initials}
          />
        </View>;
      case BarcodeScannerAppState.SCANNED:
        return <View style={styles.container}>
          <BarCodeDisplay
            id={sampleId}
            barCodeId={barCodeId}
            date={sampleDate}
            location={locationStr}
            initials={initials}
          />
          <ActionButtons/>
        </View>;
      case BarcodeScannerAppState.SCANNING:
        return <Scanner
          onScanned={handleBarCodeScanned}
          onCancel={_home}
          cameraType={cameraType}
        />;
      case BarcodeScannerAppState.INPUT_ID:
        return <IdNumberInput
          onScanned={handleBarCodeScanned}
          onCancel={_home}
          cameraType={undefined}
        />;
      case BarcodeScannerAppState.INPUT_INITIALS:
        return <InitialsInput
          onSave={handleInitialsInput}
          onCancel={_home}
        />;
      case BarcodeScannerAppState.INPUT_LINE_COUNT:
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
        <AppContent appState={appState}/>
      </SafeAreaView>
    </PaperProvider>
  );
};

AppRegistry.registerComponent(appExpo.name, () => Main);
