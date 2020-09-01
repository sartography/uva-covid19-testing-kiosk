import {BarCodeScanner} from 'expo-barcode-scanner';
import React, {ReactElement} from 'react';
import {Button} from 'react-native-paper';
import {ButtonProps, ScannerProps} from '../models/ElementProps';
import {colors, styles} from './Styles';

export const Scanner = (props: ScannerProps): ReactElement => {
  return <BarCodeScanner
    onBarCodeScanned={props.onScanned}
    style={styles.fullScreen}
  />;
};

export const ScanButton = (props: ButtonProps): ReactElement => {
  return <Button
    icon="camera"
    mode="contained"
    color={colors.accent}
    onPress={props.onClicked}
    style={styles.btnLg}
    labelStyle={styles.btnLg}
  >Scan Barcode</Button>;
};
