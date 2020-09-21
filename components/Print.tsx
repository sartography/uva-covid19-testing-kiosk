import AsyncStorage from '@react-native-community/async-storage';
import {format} from 'date-fns';
import * as Print from 'expo-print';
import React, {ReactElement, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Button, Title} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import {defaults} from '../config/default';
import {BarCodeProps, ButtonProps, PrintingProps} from '../models/ElementProps';
import {Sample} from '../models/Sample';
import {labelLayouts} from '../models/LabelLayout';
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
  const layout = labelLayouts[props.labelLayout];
  layout.numCopies = props.numCopies;
  const d = layout.dimensions;

  const styleHtml = `
    <style>
      @media print {
        @page {
          size: ${d.pageWidth} ${d.pageHeight} landscape;
          margin: 0 !important; 
          padding: 0 !important;
        }
        
        html, body {
          width: ${d.pageWidth};
          height: ${d.pageHeight};    
          margin: 0 !important; 
          padding: 0 !important;
          overflow: hidden;
        }
        
        .page-container {
          display: grid;
          grid-template-columns: ${Array(layout.numCols).fill('1fr').join(' ')};
          grid-column-gap: ${d.columnGapWidth};
          margin: 0;
          padding: 0;
        }
        
        .label-container {
          display: block;
          position: relative;
          margin: ${d.marginWidth};
          padding: 0;
          width: ${d.labelSize};
          height: ${d.labelSize};
        }

        .circle {
          position: absolute;
          top: 0;
          left: 0;
          width: ${d.labelSize};
          height: ${d.labelSize};
          color: #000;
          text-align: center;
          margin: 0;
          padding: 0;
          border-radius: ${d.labelSize};
        }
        
        .circle .date,
        .circle .time,
        .circle .location,
        .circle .barCodeId {
          position: absolute;
          margin: 0;
          padding: 0;
          font-size: ${d.fontSize};
          font-weight: bold;
          font-family: monospace;
          text-align: center;
          line-height: 1;
        }

        .circle .date      { top: ${d.topTextMargin};       left: 0;                    width: 100%; }
        .circle .time      { top: ${d.sideTextTop};         left: ${d.sideTextMargin};  width: ${d.sideTextWidth}; }
        .circle .location  { top: ${d.sideTextTop};         right: ${d.sideTextMargin}; width: ${d.sideTextWidth}; }
        .circle .barCodeId { bottom: ${d.bottomTextMargin}; left: 0;                    width: 100%; }
        
        svg {
          position: absolute;
          top: 0;
          left: 0;
          width: ${d.labelSize};
          height: ${d.labelSize};
        }
      }
    </style>
  `;

  // Repeat the page HTML for as many copies as we need.
  const pagesArray = [];

  for (let i=0; i<layout.numCopies; i++) {
    for (let j=0; j<layout.numCols; j++) {
      const svgString = await qrcode.toString(props.id,  {
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
        <div class="label-container">
          <div class="circle">
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
              ${props.location.slice(2)}
            </div>
            <div class="barCodeId">#${props.barCodeId}</div>
          </div>
        </div>
      `;

      pagesArray.push(pageHtml);
    }
  }

  const pagesHtml = pagesArray.join('\n');
  const html = `
    ${styleHtml}
    <div class="page-container">
      ${pagesHtml}
    </div>
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
    <Text style={styles.label}>Date: {format(props.date, defaults.dateDisplayFormat)}</Text>
    <Text style={styles.label}>Location #: {props.location}</Text>
    <QRCode value={props.id} ecl="H"/>
  </View>;
}
