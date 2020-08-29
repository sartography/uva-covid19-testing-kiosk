import React, {ReactElement} from 'react';
import {Button, Text, View} from 'react-native';
import Barcode from 'react-native-barcode-builder';
import {BarCodeProps, ButtonProps, PrintingProps} from '../models/ElementProps';
import {styles} from './Styles';

export const PrintButton = (props: ButtonProps): ReactElement => {
  return <Button
    title={'Print Labels'}
    onPress={props.onClicked}
  />;
}

export const PrintingMessage = (props: PrintingProps): ReactElement => {
  return <View>
    <Text>Printing...</Text>
    <Button
      title={'Cancel'}
      onPress={props.onCancel}
    />
  </View>;
}

export const BarCodeDisplay = (props: BarCodeProps): ReactElement => {
  const data = `${props.id}-${props.date.getTime()}-${props.location}`;
  return <View style={styles.preview}>
    <Text style={styles.label}>ID#: {props.id}</Text>
    <Text style={styles.label}>Date: {props.date.toLocaleDateString()}, {props.date.toLocaleTimeString()}</Text>
    <Text style={styles.label}>Location {props.location}</Text>
    <Barcode width={1} height={40} text={data} value={data} format={'CODE128'}/>
  </View>;
}
