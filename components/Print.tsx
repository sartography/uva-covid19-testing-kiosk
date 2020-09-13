import AsyncStorage from '@react-native-community/async-storage';
import {format} from 'date-fns';
import * as Print from 'expo-print';
import React, {ReactElement, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Button, Title} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import {dateDisplayFormat} from '../config/default';
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
  const numCopies = props.numCopies; // Number of copies to print
  const units = 'mm';
  const pageSize = 28.6;
  const pageWidth = `${pageSize}${units}`;
  const sideTextWidth = `4${units}`;
  const sideTextTop = `11${units}`;
  const sideTextMargin = `1.5${units}`;
  const topTextMargin = `3${units}`;
  const bottomTextMargin = `2.5${units}`;
  const fontSize = `${6 * 0.3528}${units}`; // 6pt * ( 0.3528 mm / pt )

  const styleHtml = `
    <style>
      @media print {
        @page {
          size: ${pageWidth};
          margin: 0;
          padding: 0;
        }
        
        html, body {
          height: ${100 * numCopies}vh; 
          margin: 0 !important; 
          padding: 0 !important;
          overflow: hidden;
        }
        
        .page-container {
          display: block;
          position: relative;
          margin: 0;
          padding: 0;
          width: ${pageWidth};
          height: ${pageWidth};
        }

        .circle {
          position: absolute;
          top: 0;
          left: 0;
          width: ${pageWidth};
          height: ${pageWidth};
          color: #000;
          text-align: center;
          margin: 0;
          padding: 0;
          border-radius: ${pageWidth};
        }
        
        .page-container .date,
        .page-container .time,
        .page-container .location,
        .page-container .barCodeId {
          position: absolute;
          margin: 0;
          padding: 0;
          font-size: ${fontSize};
          font-weight: bold;
          font-family: monospace;
          text-align: center;
          line-height: 1;
        }

        .page-container .date      { top: ${topTextMargin};       left: 0;                  width: 100%; }
        .page-container .time      { top: ${sideTextTop};         left: ${sideTextMargin};  width: ${sideTextWidth}; }
        .page-container .location  { top: ${sideTextTop};         right: ${sideTextMargin}; width: ${sideTextWidth}; }
        .page-container .barCodeId { bottom: ${bottomTextMargin}; left: 0;                  width: 100%; }
        
        svg {
          position: absolute;
          top: 0;
          left: 0;
          width: ${pageWidth};
          height: ${pageWidth};
        }
      }
    </style>
  `;

  // Repeat the page HTML for as many copies as we need.
  const pagesArray = [];

  for (let i=0; i<numCopies; i++) {
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

    const pageHtml = `
      <div class="page-container">
        <div class="circle"></div>
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

    pagesArray.push(pageHtml);
  }

  const pagesHtml = pagesArray.join('\n');
  const html = `
    ${styleHtml}
    ${pagesHtml}
  `;

  return Print.printAsync({html});
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
        initials={props.initials}
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
    <Text style={styles.label}>ID #: {props.id}</Text>
    <Text style={styles.label}>Date: {format(props.date, dateDisplayFormat)}</Text>
    <Text style={styles.label}>Location #: {props.location}</Text>
    <QRCode value={props.id}/>
  </View>;
}
