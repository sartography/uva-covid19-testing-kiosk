import {BarCodeScanner} from 'expo-barcode-scanner';
import React, {ReactElement, useState} from 'react';
import {Text, View} from 'react-native';
import {Button, DefaultTheme, HelperText, Subheading, TextInput, Title} from 'react-native-paper';
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
        <View style={styles.captureBox}/>
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

  return <ScanCamera key={componentKey}/>;
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

export const InputIdButton = (props: ButtonProps): ReactElement => {
  return <Button
    icon="keyboard"
    mode="text"
    color={colors.onBackground}
    onPress={props.onClicked}
  >Enter ID Number Manually</Button>;
};

export const IdNumberInput = (props: ScannerProps): ReactElement => {
  const [inputStr, setInputStr] = useState<string>('');
  const pattern = /^[\d]{9}$/;
  const hasErrors = () => {
    return !pattern.test(inputStr);
  };

  const onSubmit = () => {
    props.onScanned({type: '', data: inputStr});
  }

  return <View style={styles.settings}>
    <Title style={styles.headingInverse}>Settings</Title>
    <View style={{marginBottom: 10}}>
      <Subheading style={{color: DefaultTheme.colors.text, marginBottom: 60}}>
        Please double check that you have entered the number correctly. Entering an incorrect ID number will prevent
        patients from receiving their test results.
      </Subheading>
      <TextInput
        label="ID #"
        value={inputStr}
        onChangeText={inputStr => setInputStr(inputStr)}
        mode="outlined"
        theme={DefaultTheme}
      />
      <HelperText type="error" visible={hasErrors()}>
        ID number must be exactly 9 digits. No other characters are allowed.
      </HelperText>
      <Button
        icon="check"
        mode="contained"
        color={colors.primary}
        style={{marginBottom: 10}}
        disabled={hasErrors()}
        onPress={onSubmit}
      >Submit</Button>
      <Button
        icon="cancel"
        mode="outlined"
        color={colors.primary}
        onPress={props.onCancel}
      >Cancel</Button>
    </View>
  </View>;
};
