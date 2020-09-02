import React, {ReactElement, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Button, Title} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import {BarCodeProps, ButtonProps, PrintingProps} from '../models/ElementProps';
import {Sample} from '../models/Sample';
import {colors, styles} from './Styles';
import AsyncStorage from '@react-native-community/async-storage';
import * as Print from 'expo-print';
import {format} from 'date-fns'

enum PrintStatus {
  SAVING = 'SAVING',
  PRINTING = 'PRINTING',
  DONE = 'DONE',
}

const _save = (props: PrintingProps): Promise<void> => {
  const storageVal: Sample = {
    id: props.id,
    barcodeId: props.barCodeId,
    createdAt: props.date,
    locationId: props.location,
  };
  return AsyncStorage.setItem(props.id, JSON.stringify(storageVal));
}

const _print = (props: PrintingProps): Promise<void> => {
  console.log('props.svg', props.svg);
  return Print.printAsync({
    html: `
      <style>
        @media print {
          @page {
            size: 2in 1.25in;
            margin: 0;
          }
          
          html, body {
            margin: 0;
            padding: 0;
          }

          div.box {
            width: 2in;
            height: 1.25in;
            color: #000;
            text-align: center;
            margin: 0;
            padding: 0;
          }
          
          div.box p {
            font-size: 10pt;
            margin: 0;
            padding: 0;
          }
          
          svg {
            position: absolute;
            bottom: 0;
            left: 0;
          }
        }
      </style>
      <div class="box">
        <p>ID#: ${props.barCodeId}</p>
        <p>Date: ${props.date.toLocaleDateString()} ${props.date.toLocaleTimeString()}</p>
        <p>Loc#: ${props.location}</p>
        ${props.svg}
        <p>${props.id}</p>
      </div>
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
      <BarCodeDisplay
        id={props.id}
        barCodeId={props.barCodeId}
        date={props.date}
        location={props.location}
        svg={props.svg}
      />
    </View>
    <View style={styles.container}>
      <Title style={styles.heading}>{statusStr}</Title>
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
  console.log('BarCodeDisplay props.svg', props.svg);
  return <View style={styles.printPreview}>
    <Text style={styles.label}>ID#: {props.id}</Text>
    <Text style={styles.label}>Date: {props.date.toLocaleDateString()}, {props.date.toLocaleTimeString()}</Text>
    <Text style={styles.label}>Location {props.location}</Text>
    <QRCode value={props.id} />
  </View>;
}
