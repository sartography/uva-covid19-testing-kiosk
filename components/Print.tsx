import AsyncStorage from '@react-native-community/async-storage';
import {format} from 'date-fns';
import * as Print from 'expo-print';
import React, {ReactElement, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Button, Title} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import {BarCodeProps, ButtonProps, PrintingProps} from '../models/ElementProps';
import {Sample} from '../models/Sample';
import {colors, styles} from './Styles';

const qrcode = require('qrcode');

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

const _print = async (props: PrintingProps): Promise<void> => {
  const svgString = await qrcode.toString(props.id, {
    width: 72,   // 20mm
    height: 72,
    margin: 10,
    errorCorrectionLevel: 'high',
    type: 'svg',
    color: {
      light: '#ffffff00',
      dark: '#000',
    }
  });

  //
  const fontSize = 6 * ( 1 / 72 ); // 6pt * ( 1pt / 72in )
  const pageSize = 28.6;           // Page size in millimeters
  const numCopies = 3;             // Number of copies to print
  const pageUnits = 'mm';
  const styleHtml = `
    <style>
      @media print {
        @page {
          size: ${pageSize * numCopies}${pageUnits};
          margin: 0;
        }
        
        html, body {
          margin: 0;
          padding: 0;
        }
        
        .page-container {
          position: relative;
          margin: 0;
          padding: 0;
        }

        .circle {
          position: absolute;
          top: 0;
          left: 0;
          width: ${pageSize}${pageUnits};
          height: ${pageSize}${pageUnits};
          color: #000;
          text-align: center;
          margin: 0;
          padding: 0;
          border-radius: ${pageSize}${pageUnits};
          background-color: transparent;
        }
        
        .circle .date,
        .circle .time,
        .circle .location,
        .circle .barCodeId {
          position: absolute;
          margin: 0;
          padding: 0;
          font-size: ${fontSize}${pageUnits};
          font-family: monospace;
          text-align: center;
          line-height: 1;
        }

        .circle .date      { top: 3.5mm;  left: 0;      width: 100%; }
        .circle .time      { top: 11mm;   left: 1.5mm;  width: 4mm;  }
        .circle .location  { top: 11mm;   right: 1.5mm; width: 4mm;  }
        .circle .barCodeId { bottom: 3mm; left: 0;      width: 100%; }
        
        svg {
          position: absolute;
          top: 0;
          left: 0;
          width: ${pageSize}${pageUnits};
          height: ${pageSize}${pageUnits};
        }
      }
    </style>
  `;

  const pageHtml = `
    <div class="page-container">
      <div class="circle" />
      ${svgString}
      <div class="date">${format(props.date, 'yyyy-MM-dd')}</div>
      <div class="time">
        T<br />
        ${format(props.date, 'HH')}<br />
        ${format(props.date, 'mm')}
      </div>
      <div class="location">
        L<br />
        ${props.location.slice(0, 2)}<br />
        ${props.location.slice(2)}<br />
      </div>
      <div class="barCodeId">#${props.barCodeId}</div>
    </div>
  `;

  // Repeat the page HTML for as many copies as we need.
  const pagesHtml = new Array(numCopies).fill(pageHtml).join('\n');

  return Print.printAsync({
    html: `
      ${styleHtml}
      ${pagesHtml}
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
      />
    </View>
    <View style={styles.container}>
      <Title style={styles.heading}>{statusStr}</Title>
      <RetryButton/>
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
  return <View style={styles.printPreview}>
    <Text style={styles.label}>ID#: {props.id}</Text>
    <Text style={styles.label}>Date: {props.date.toLocaleDateString()}, {props.date.toLocaleTimeString()}</Text>
    <Text style={styles.label}>Location {props.location}</Text>
    <QRCode value={props.id}/>
  </View>;
}
