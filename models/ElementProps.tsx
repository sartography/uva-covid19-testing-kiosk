import {BarCodeScannedCallback} from 'expo-barcode-scanner';
import {BarcodeScannerAppState} from './BarcodeScannerAppState';

export interface ElementProps {
  title?: string;
}

export interface StateProps extends ElementProps {
  appState: BarcodeScannerAppState;
}

export interface BarCodeProps extends ElementProps {
  id: string;
  barCodeId: string;
  date: Date;
  location: string;
}

export interface ButtonProps extends ElementProps {
  onClicked: () => void;
}

export interface ScannerProps extends ElementProps {
  onScanned: BarCodeScannedCallback;
  onCancel: () => void;
}

export interface PrintingProps extends BarCodeProps {
  onCancel: () => void;
}
