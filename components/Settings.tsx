import React, {ReactElement, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {DefaultTheme, Subheading, Title, RadioButton, Paragraph, TextInput, HelperText, Button} from 'react-native-paper';
import {CameraType, LabelLayout, SettingsScreenProps} from '../models/ElementProps';
import {colors, styles} from './Styles';

const _stringToInt = (inputStr: string): number => {
  const num = parseInt(inputStr || '0', 10);
  if (!isNaN(num)) {
    return num;
  }

  return 0;
}

export const SettingsScreen = (props: SettingsScreenProps): ReactElement => {
    const [newCameraType, setNewCameraType] = useState<CameraType>(props.cameraType);
    const [newLabelLayout, setNewLabelLayout] = useState<LabelLayout>(props.labelLayout);
    const [newNumCopies, setNewNumCopies] = useState<number>(props.numCopies);
    const [newLocationStr, setNewLocationStr] = useState<string>(props.locationStr);

    const _numCopiesHasErrors = () => {
      return newNumCopies <= 0 || newNumCopies > 10;
    };

    const locPattern = /^[\d]{4}$/;
    const _locHasErrors = () => {
      return !locPattern.test(newLocationStr);
    };

    return <ScrollView style={styles.settings}>
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

      <View style={{marginBottom: 40}}>
        <Subheading style={{color: DefaultTheme.colors.text}}>Label Layout</Subheading>
        <RadioButton.Group
          onValueChange={value => setNewLabelLayout(value as LabelLayout)}
          value={newLabelLayout as string}
        >
          <RadioButton.Item
            value="round_32mm_1up"
            label="Single 1.26in round labels"
            theme={DefaultTheme}
          />
          <RadioButton.Item
            value="round_32mm_2up"
            label="Two 1.26in round labels, side-by-side"
            theme={DefaultTheme}
          />
        </RadioButton.Group>
      </View>

      <View style={{marginBottom: 40}}>
        <Subheading style={{color: DefaultTheme.colors.text}}>Copies of labels</Subheading>
        <Paragraph style={{color: DefaultTheme.colors.text}}>
          Input the number of sets of labels to print for each patient
        </Paragraph>
        <TextInput
          label="# of copies"
          value={newNumCopies.toString()}
          onChangeText={inputStr => setNewNumCopies(_stringToInt(inputStr))}
          mode="outlined"
          theme={DefaultTheme}
          keyboardType="numeric"
        />
        <HelperText type="error" visible={_numCopiesHasErrors()}>
          Please enter a number from 1 to 10.
        </HelperText>
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
          keyboardType="numeric"
        />
        <HelperText type="error" visible={_locHasErrors()}>
          Location number must be exactly 4 digits. No other characters are allowed.
        </HelperText>
        <Button
          icon="content-save"
          mode="contained"
          color={colors.primary}
          style={{marginBottom: 10}}
          disabled={_locHasErrors() || _numCopiesHasErrors()}
          onPress={() => props.onSave(newCameraType, newLabelLayout, newNumCopies, newLocationStr)}
        >Save</Button>
        <Button
          icon="cancel"
          mode="outlined"
          color={colors.primary}
          onPress={props.onCancel}
        >Cancel</Button>
      </View>
    </ScrollView>
  }
