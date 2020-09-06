import {ButtonProps, InputLineCountScreenProps} from '../models/ElementProps';
import React, {ReactElement, useState} from 'react';
import {View} from 'react-native';
import {DefaultTheme, Subheading, Title, RadioButton, Paragraph, TextInput, HelperText, Button} from 'react-native-paper';
import {TextInput as NumberInput} from 'react-native';
import {colors, styles} from './Styles';

export const InputLineCountButton = (props: ButtonProps): ReactElement => {
  return <Button
    icon="timer"
    mode="text"
    color={colors.onBackground}
    onPress={props.onClicked}
    style={{marginTop: 30}}
  >Enter Line Count</Button>;
};

export const InputLineCountScreen = (props: InputLineCountScreenProps): ReactElement => {
    const [newLineCount, setNewLineCount] = useState<string>('0');

    const hasErrors = () => {
      if (newLineCount !== undefined && newLineCount !== null) {
        const newInt = parseInt(newLineCount, 10);
        return (
          isNaN(newInt) ||
          !isFinite(newInt) ||
          newInt < 0 ||
          newInt > 14000
        );
      } else {
        return true;
      }
    };

    return <View style={styles.settings}>
      <Title style={{color: DefaultTheme.colors.text}}>Enter Line Count</Title>
      <View style={{marginBottom: 10}}>
        <Subheading style={{color: DefaultTheme.colors.text}}>How many people are waiting in line?</Subheading>
        <TextInput
          label="# of people"
          value={newLineCount}
          onChangeText={inputStr => setNewLineCount(inputStr)}
          mode="outlined"
          theme={DefaultTheme}
          keyboardType="numeric"
        />
        <HelperText type="error" visible={hasErrors()}>
          Line count must be a whole number greater than 0.
        </HelperText>
        <Button
          icon="content-save"
          mode="contained"
          color={colors.primary}
          style={{marginBottom: 10}}
          disabled={hasErrors()}
          onPress={() => props.onSave(parseInt(newLineCount, 10))}
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
