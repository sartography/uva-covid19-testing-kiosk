import {BarCodeScanner} from 'expo-barcode-scanner';
import React, {ReactElement, useState} from 'react';
import {View, Text} from 'react-native';
import {Button} from 'react-native-paper';
import {ButtonProps, ScannerProps} from '../models/ElementProps';
import {colors, styles} from './Styles';

declare type CameraType = number | 'front' | 'back' | undefined;

export const Scanner = (props: ScannerProps): ReactElement => {
  const [componentKey, setComponentKey] = useState<number>(0);
  const [cameraType, setCameraType] = useState<CameraType>('back');

  const _toggleCameraType = () => {
    setCameraType(cameraType === 'front' ? 'back' : 'front');
    setComponentKey(componentKey + 1);
  }

  const ScanCamera = (): ReactElement => {
    return <View style={styles.container}>
      <View style={styles.container}>
        <BarCodeScanner
          type={cameraType}
          onBarCodeScanned={props.onScanned}
          style={styles.fullScreen}
        />
      </View>
      <View style={styles.centerMiddle}>
        <View style={styles.captureBox} />
      </View>
      <Text style={styles.subtitle}>
        Hold your ID card up, with the barcode facing the camera. Keep the card in the green box.
      </Text>
      <View style={styles.centerMiddle}>
        <Button
          mode="contained"
          color={colors.primary}
          icon="camera-switch"
          onPress={_toggleCameraType}
          style={{marginVertical: 10}}
        >Switch Camera</Button>
        <Button
          mode="text"
          color={colors.primary}
          icon="cancel"
          onPress={props.onCancel}
          style={styles.btnWhite}
        >Cancel</Button>
      </View>
    </View>;
  }

  return <ScanCamera key={componentKey} />;
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
