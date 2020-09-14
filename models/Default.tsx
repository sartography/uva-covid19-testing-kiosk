import {CameraType} from './ElementProps';

export interface AppDefaults {
  countsCollection: string;
  samplesCollection: string;
  dateEncodedFormat: string;
  dateDisplayFormat: string;
  numCopies: number;
  cameraType: CameraType;
  locationId: string;
  lineCountRegex: RegExp;
  qrCodeRegex: RegExp;
  barCodeRegex: RegExp;
  barCodeNumLength: number;
}
