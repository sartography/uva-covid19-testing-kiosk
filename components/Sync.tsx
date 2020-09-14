import AsyncStorage from '@react-native-community/async-storage';
import React, {ReactElement, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Snackbar, Title} from 'react-native-paper';
import {defaults} from '../config/default';
import {CollectionMeta} from '../models/Collection';
import {SyncProps} from '../models/ElementProps';
import {LineCount} from '../models/LineCount';
import {Sample} from '../models/Sample';
import {CancelButton} from './Common';
import {styles} from './Styles';
import * as firebase from 'firebase';
import 'firebase/firestore';

export const sendDataToFirebase = async (newData: Array<Sample | LineCount>, collection: firebase.firestore.CollectionReference) => {
  const writes = newData.map((s: Sample | LineCount) => collection.doc(s.id).set(s));
  await Promise.all(writes);
}

export const SyncMessage = (props: SyncProps): ReactElement => {
  const [syncStatus, setSyncStatus] = useState<string>('Syncing data...');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Display an error message if Firebase sync fails.
  const _handleError = (error: any, dataTypeLabel: string) => {
    setIsError(true);
    setErrorMessage(error);
    setSyncStatus(`Error occurred while syncing ${dataTypeLabel} data.`);
    props.onCancel();
  };

  // Delete locally-cached data from AsyncStorage
  const _clearLocalCache = (keysToRemove: string[], dataTypeLabel: string) => {
    AsyncStorage.multiRemove(keysToRemove).then(() => {
      setSyncStatus(`${dataTypeLabel} data synced.`);
      props.onSync();
    });
  }

  // Upload any new locally-stored items to Firebase, then remove them from local storage.
  const _syncCollection = (localStorageKeys: string[], collection: CollectionMeta) => {
    const newItemsKeys = localStorageKeys.filter(k => collection.keyRegex.test(k));
    AsyncStorage.multiGet(newItemsKeys, (errors, dataTuples) => {
      if (dataTuples && (dataTuples.length > 0)) {
        const data: Sample[] | LineCount[] = [];
        dataTuples.forEach(t => {
          if (t[1] !== null) {
            const lineCount = JSON.parse(t[1]);
            data.push(lineCount);
          }
        });

        sendDataToFirebase(data, collection.firebaseCollection)
          .then(() => _clearLocalCache(newItemsKeys, collection.label))
          .catch(error => _handleError(error, collection.label));
      }
    });
  }

  useEffect(() => {
    // Detect when user is online. If online, sync data with Firebase.
    if (props.isConnected) {
      const collectionsToSync = [
        {
          firebaseCollection: props.countsCollection,
          keyRegex: defaults.lineCountRegex,
          label: 'Line Counts',
          unsubscribe: props.countsCollection.onSnapshot(q => {}, e => {}),
        },
        {
          firebaseCollection: props.samplesCollection,
          keyRegex: defaults.qrCodeRegex,
          label: 'QR Codes',
          unsubscribe: props.samplesCollection.onSnapshot(q => {}, e => {}),
        },
      ];

      // Upload new data to Firebase
      AsyncStorage.getAllKeys().then(keys => {
        collectionsToSync.forEach(c => _syncCollection(keys, c));
      });

      // Unsubscribe from all collections
      return () => collectionsToSync.forEach(c => c.unsubscribe());
    } else {
      // If not online, just go home.
      setSyncStatus('Device is not online. Skipping sync...');
      props.onCancel();
    }
  });

  return <View style={styles.container}>
    <View style={styles.centerMiddle}>
      <Title style={styles.heading}>{syncStatus}</Title>
      <Snackbar
        visible={isError}
        onDismiss={props.onCancel}
        style={styles.error}
      >{errorMessage === '' ? 'Something went wrong. Try again.' : errorMessage}</Snackbar>
      <CancelButton onClicked={props.onCancel} />
    </View>
  </View>;
}
