import {BarCodeScanner} from 'expo-barcode-scanner';
import React, {ReactElement} from 'react';
import {Button} from 'react-native';
import {ButtonProps, ScannerProps} from '../models/ElementProps';
import {styles} from './Styles';

export const Scanner = (props: ScannerProps): ReactElement => {
  return <BarCodeScanner
    onBarCodeScanned={props.onScanned}
    style={styles.fullScreen}
  />;
};

export const ScanButton = (props: ButtonProps): ReactElement => {
  return <Button
    color='#f00'
    title={'Scan Barcode'}
    onPress={props.onClicked}
  />;
};
