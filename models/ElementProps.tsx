import {BarCodeScannedCallback} from 'expo-barcode-scanner';
import {LabelLayoutType} from './LabelLayout';
import {BarcodeScannerAppState} from './BarcodeScannerAppState';
import * as firebase from 'firebase';
import 'firebase/firestore';

export declare type CameraType = number | 'front' | 'back' | undefined;

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
  initials: string;
}

export interface ButtonProps extends ElementProps {
  onClicked: () => void;
}

export interface InputInitialsProps extends ElementProps {
  onSave: (newInitials: string) => void;
  onCancel: () => void;
}

export interface InputLineCountScreenProps extends ElementProps {
  onSave: (newCount: number) => void;
  onCancel: () => void;
}

export interface SettingsScreenProps extends ElementProps {
  cameraType: CameraType;
  labelLayout: LabelLayoutType;
  numCopies: number;
  locationStr: string;
  onSave: (newCameraType: CameraType, newLabelLayout: LabelLayoutType, newNumCopies: number, newLocationStr: string) => void;
  onCancel: () => void;
}

export interface ScannerProps extends ElementProps {
  onScanned: BarCodeScannedCallback;
  onCancel: () => void;
  cameraType: CameraType;
}

export interface SyncProps extends ElementProps {
  isConnected: boolean;
  onSync: () => void;
  onCancel: () => void;
  samplesCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
  countsCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
}

export interface PrintingProps extends BarCodeProps {
  labelLayout: LabelLayoutType;
  numCopies: number;
  onCancel: () => void;
}
