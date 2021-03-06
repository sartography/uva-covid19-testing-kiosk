/**
 Example configuration file. Make a copy of this file, name it "default.tsx", and place it in the config directory.
 Then modify the values below to match the actual Firebase configuration.
 */
import {AppDefaults} from '../models/Default';
import {CameraType} from '../models/ElementProps';
import {LabelLayoutType} from '../models/LabelLayout';

// Firebase project config from https://console.firebase.google.com > Project Settings > General > Your apps > Web App
export const firebaseConfig = {
  apiKey: 'api_key_goes_here',
  authDomain: 'auth_domain_goes_here',
  databaseURL: 'database_url_goes_here',
  projectId: 'project_id_goes_here',
  storageBucket: 'storage_bucket_goes_here',
  messagingSenderId: 'messaging_sender_id_goes_here',
  appId: 'app_id_goes_here',
};

// Default form field and data values
export const defaults: AppDefaults = {
  countsCollection: 'counts',                           // Name of collection for Line Counts in Firebase.
  samplesCollection: 'samples',                         // Name of collection for Line Counts in Firebase.
  dateEncodedFormat: 'yyyyMMddHHmm',                    // Format for dates when encoded in IDs for database records.
  dateDisplayFormat: 'MM/dd/yyyy, hh:mm aa',            // Format for dates when displayed to user.
  numCopies: 2,                                         // Default number of copies of labels to print. Can be overridden by user setting.
  labelLayout: 'round_32mm_1up' as LabelLayoutType,         // Which label layout to use for printing. Can be overridden by user setting.
  cameraType: 'back' as CameraType,                     // Which camera to use for capturing bar codes. Can be overridden by user setting.
  locationId: '0000',                                   // Default location ID. Can be overridden by user setting.
  lineCountRegex: /^[\d]{4}-[\d]{12}$/,                 // ID format for Line Count records.
  qrCodeRegex: /^[\d]{9}-[a-zA-Z]+-[\d]{12}-[\d]{4}$/,  // ID format for QR Code records.
  barCodeNumLength: 9,                                  // Number of digits in Bar Code.
  barCodeRegex: /^[\d]{14}$|^[\d]{9}$/,                 // Pattern for Bar Code data. Scanned barcodes will be either 9 or 14 digits long.
                                                        // Manually-entered ID numbers will be exactly 9 digits long.
}
