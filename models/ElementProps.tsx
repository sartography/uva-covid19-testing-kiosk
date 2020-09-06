import {BarCodeScannedCallback} from 'expo-barcode-scanner';
import {BarcodeScannerAppState} from './BarcodeScannerAppState';

export declare type CameraType = number | 'front' | 'back' | undefined;
export declare type CheckedStatus ='checked' | 'unchecked' | undefined;

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

export interface InputLineCountScreenProps extends ElementProps {
  onSave: (newCount: number) => void;
  onCancel: () => void;
}

export interface SettingsScreenProps extends ElementProps {
  cameraType: CameraType;
  locationStr: string;
  onSave: (newCameraType: CameraType, newLocationStr: string) => void;
  onCancel: () => void;
}

export interface ScannerProps extends ElementProps {
  onScanned: BarCodeScannedCallback;
  onCancel: () => void;
  cameraType: CameraType;
}

export interface PrintingProps extends BarCodeProps {
  onCancel: () => void;
}
