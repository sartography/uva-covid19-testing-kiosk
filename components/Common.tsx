import React, {ReactElement} from 'react';
import {Button} from 'react-native';
import {ButtonProps} from '../models/ElementProps';

export const CancelButton = (props: ButtonProps): ReactElement => {
  return <Button
    title={'Cancel'}
    onPress={props.onClicked}
  />;
};
