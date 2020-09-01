import React, {ReactElement, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
// @ts-ignore
import Barcode from 'react-native-barcode-builder';
import {Button, Title} from 'react-native-paper';
import {BarCodeProps, ButtonProps, PrintingProps} from '../models/ElementProps';
import {colors, styles} from './Styles';
import AsyncStorage from '@react-native-community/async-storage';
import * as Print from 'expo-print';

enum PrintStatus {
  SAVING = 'SAVING',
  PRINTING = 'PRINTING',
  DONE = 'DONE',
}

const _renderBarCodeRects = (props: PrintingProps): string => {
  const dataStr = _propsToDataString(props);
  const rects: string[] = [];

  // TODO: set base width from label width in pixels
  // 2 inches = 190 pixels
  // for now, just guesstimate.
  const baseWidth = 7;

  for (let i = 0; i < dataStr.length; i++) {
    // TODO: Convert dataStr to barcode rectangles with x, y, width, height
    // barcodejs library has some useful stuff?
    // Or maybe somehow use something in the guts of react-native-barcode-builder?
    // For now, just put in some dummy x values and widths.
    rects.push(`<rect width="${Math.floor(Math.random() * baseWidth)}" height="20" x="${baseWidth * i}" y="70" fill="black" />`);
  }

  return rects.join(' ')
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
  const dataStr = _propsToDataString(props);
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
        <p>ID#: ${props.id}</p>
        <p>Date: ${props.date.toLocaleDateString()} ${props.date.toLocaleTimeString()}</p>
        <p>Loc#: ${props.location}</p>
        <svg width="190" height="90" id="barCode">
            ${_renderBarCodeRects(props)}
        </svg>
        <p>${dataStr}</p>
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
      <BarCodeDisplay id={props.id} date={props.date} location={props.location} />
      <BarCodeDisplay id={props.id} date={props.date} location={props.location} />
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
  const data = _propsToDataString(props);
  return <View style={styles.printPreview}>
    <Text style={styles.label}>ID#: {props.id}</Text>
    <Text style={styles.label}>Date: {props.date.toLocaleDateString()}, {props.date.toLocaleTimeString()}</Text>
    <Text style={styles.label}>Location {props.location}</Text>
    <Barcode width={1.1} height={40} text={data} value={data} format={'CODE128'}/>
  </View>;
}
