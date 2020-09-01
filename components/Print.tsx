import React, {ReactElement, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
// @ts-ignore
import Barcode from 'react-native-barcode-builder';
import {Button} from 'react-native-paper';
import {BarCodeProps, ButtonProps, PrintingProps} from '../models/ElementProps';
import {colors, styles} from './Styles';
import AsyncStorage from '@react-native-community/async-storage';
import * as Print from 'expo-print';

enum PrintStatus {
  SAVING = 'SAVING',
  PRINTING = 'PRINTING',
  DONE = 'DONE',
}

const _propsToDataString = (props: BarCodeProps): string => {
  return `${props.id}-${props.date.getTime()}-${props.location}`;
}

const _save = (props: PrintingProps): Promise<void> => {
  const storageKey = _propsToDataString(props);
  const storageVal = {
    id: props.id,
    date: props.date,
    location: props.location,
  };
  return AsyncStorage.setItem(storageKey, JSON.stringify(storageVal));
}

const _print = (props: PrintingProps): Promise<void> => {
  return Print.printAsync({
    html: `
      <style>
        @page {
          margin: 20px;
          size: 2in 1.25in;
        }
      </style>
      <h1 style="width: 100%; height: 100%; border: 4px solid black;">This is a test</h1>
    `,
  });
}

export const PrintButton = (props: ButtonProps): ReactElement => {
  return <Button
    icon="printer"
    mode="contained"
    color={colors.accent}
    onPress={props.onClicked}
    style={styles.btnLg}
    labelStyle={styles.btnLg}
  >Print Labels</Button>;
}

export const PrintingMessage = (props: PrintingProps): ReactElement => {
  const [statusStr, setStatusStr] = useState<string>('Saving data...');
  const [printStatus, setPrintStatus] = useState<PrintStatus>(PrintStatus.SAVING);

  useEffect(() => {
    _save(props).finally(() => {
      setPrintStatus(PrintStatus.PRINTING);
      setStatusStr('Data saved. Printing...')
      _print(props).finally(() => {
        setPrintStatus(PrintStatus.DONE);
        setStatusStr('Data sent to printer.');
      });
    });
  }, []);

  const RetryButton = (): ReactElement | null => {
    if (printStatus === PrintStatus.DONE) {
      return <Button
        icon="reload"
        onPress={() => _print(props)}
        color={colors.onBackground}
        style={styles.btnLg}
        labelStyle={styles.btnLg}
      >Print again</Button>
    } else {
      return null;
    }
  }


  return <View style={styles.container}>
    <View style={styles.preview}>
      <BarCodeDisplay id={props.id} date={props.date} location={props.location} />
      <BarCodeDisplay id={props.id} date={props.date} location={props.location} />
    </View>
    <View style={styles.container}>
      <Text style={styles.heading}>{statusStr}</Text>
      <RetryButton />
      <Button
        icon="cancel"
        mode={printStatus === PrintStatus.DONE ? 'contained' : 'text'}
        color={printStatus === PrintStatus.DONE ? colors.accent : colors.onBackground}
        onPress={props.onCancel}
        style={styles.btnLg}
        labelStyle={styles.btnLg}
      >{printStatus === PrintStatus.DONE ? 'Done' : 'Cancel'}</Button>
    </View>
  </View>;
}


export const BarCodeDisplay = (props: BarCodeProps): ReactElement => {
  const data = _propsToDataString(props);
  return <View style={styles.printPreview}>
    <Text style={styles.label}>ID#: {props.id}</Text>
    <Text style={styles.label}>Date: {props.date.toLocaleDateString()}, {props.date.toLocaleTimeString()}</Text>
    <Text style={styles.label}>Location {props.location}</Text>
    <Barcode width={1.1} height={40} text={data} value={data} format={'CODE128'}/>
  </View>;
}
