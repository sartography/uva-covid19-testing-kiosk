import AsyncStorage from '@react-native-community/async-storage';
import {parse} from 'date-fns';
import React, {ReactElement, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Title} from 'react-native-paper';
import {dateFormat} from '../config/default';
import {SyncProps} from '../models/ElementProps';
import {LineCount} from '../models/LineCount';
import {Sample} from '../models/Sample';
import {CancelButton} from './Common';
import {styles} from './Styles';
// @ts-ignore
import * as firebase from 'firebase';
import 'firebase/firestore';

export const sendDataToFirebase = async (newData: Array<Sample | LineCount>, collection: firebase.firestore.CollectionReference) => {
  const writes = newData.map((s: Sample | LineCount) => collection.doc(s.id).set(s));
  await Promise.all(writes);
}

export const SyncMessage = (props: SyncProps): ReactElement => {
  const [syncStatus, setSyncStatus] = useState<string>('Syncing data...');

  useEffect(() => {
    // TODO: Detect when user is online. If online, sync data with Firebase. If not online, just go home. Alternatively, set up a timer that periodically syncs data with the database.

    // Upload any changes to Firebase
    if (props.isConnected) {
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

        sendDataToFirebase(newSamples, props.samplesCollection).then(() => {
          setSyncStatus('Data synced.');
          props.onSync();
        });
      });
    } else {
      setSyncStatus('Device is not online. Skipping sync...');
      props.onCancel();
    }
  });

  return <View style={styles.container}>
    <View style={styles.centerMiddle}>
      <Title style={styles.heading}>{syncStatus}</Title>
      <CancelButton onClicked={props.onCancel} />
    </View>
  </View>;
}
