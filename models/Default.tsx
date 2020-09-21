import {CameraType, LabelLayout} from './ElementProps';

export interface AppDefaults {
  countsCollection: string;
  samplesCollection: string;
  dateEncodedFormat: string;
  dateDisplayFormat: string;
  numCopies: number;
  labelLayout: LabelLayout;
  cameraType: CameraType;
  locationId: string;
  lineCountRegex: RegExp;
  qrCodeRegex: RegExp;
  barCodeRegex: RegExp;
  barCodeNumLength: number;
}
