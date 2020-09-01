import React, {ReactElement} from 'react';
import {Button} from 'react-native-paper';
import {ButtonProps} from '../models/ElementProps';
import {colors, styles} from './Styles';

export const CancelButton = (props: ButtonProps): ReactElement => {
  return <Button
    icon="camera"
    color={colors.text}
    onPress={props.onClicked}
    style={styles.btnLg}
    labelStyle={styles.btnLg}
  >Cancel</Button>;
};
