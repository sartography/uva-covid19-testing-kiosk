import React, {ReactElement, useState} from 'react';
import {View} from 'react-native';
import {DefaultTheme, Subheading, Title, RadioButton, Paragraph, TextInput, HelperText, Button} from 'react-native-paper';
import {CameraType, SettingsScreenProps} from '../models/ElementProps';
import {colors, styles} from './Styles';

export const SettingsScreen = (props: SettingsScreenProps): ReactElement => {
    const [newCameraType, setNewCameraType] = useState<CameraType>(props.cameraType);
    const [newLocationStr, setNewLocationStr] = useState<string>(props.locationStr);

    const pattern = /^[\d]{4}$/;
    const hasErrors = () => {
      return !pattern.test(newLocationStr);
    };

    return <View style={styles.settings}>
      <Title style={{color: DefaultTheme.colors.text}}>Settings</Title>
      <View style={{marginBottom: 40}}>
        <Subheading style={{color: DefaultTheme.colors.text}}>Camera to Use</Subheading>
        <RadioButton.Group
          onValueChange={value => setNewCameraType(value as CameraType)}
          value={newCameraType as string}
        >
          <RadioButton.Item
            value="front"
            label="Front"
            theme={DefaultTheme}
          />
          <RadioButton.Item
            value="back"
            label="Back"
            theme={DefaultTheme}
          />
        </RadioButton.Group>
      </View>

      <View style={{marginBottom: 10}}>
        <Subheading style={{color: DefaultTheme.colors.text}}>Location Code</Subheading>
        <Paragraph style={{color: DefaultTheme.colors.text}}>
          Please do NOT change this unless you know what you are doing. Entering an incorrect location number may
          prevent patients from getting accurate info about their test results.
        </Paragraph>
        <TextInput
          label="Location #"
          value={newLocationStr}
          onChangeText={inputStr => setNewLocationStr(inputStr)}
          mode="outlined"
          theme={DefaultTheme}
        />
        <HelperText type="error" visible={hasErrors()}>
          Location number must be exactly 4 digits. No other characters are allowed.
        </HelperText>
        <Button
          icon="content-save"
          mode="contained"
          color={colors.primary}
          style={{marginBottom: 10}}
          disabled={hasErrors()}
          onPress={() => props.onSave(newCameraType, newLocationStr)}
        >Save</Button>
        <Button
          icon="cancel"
          mode="outlined"
          color={colors.primary}
          onPress={props.onCancel}
        >Cancel</Button>
      </View>
    </View>
  }
