/**
 Example configuration file. Make a copy of this file, name it "default.tsx", and place it in the config directory.
 Then modify the values below to match the actual Firebase configuration.
 */
import {AppDefaults} from '../models/Default';
import {CameraType} from '../models/ElementProps';

// Firebase project config from https://console.firebase.google.com > Project Settings > General > Your apps > Web App
export const firebaseConfig = {
  apiKey: 'API_KEY_GOES_HERE',
  authDomain: 'uva-covid19-testing-kiosk.firebaseapp.com',
  databaseURL: 'https://uva-covid19-testing-kiosk.firebaseio.com',
  projectId: 'uva-covid19-testing-kiosk',
  storageBucket: 'uva-covid19-testing-kiosk.appspot.com',
  messagingSenderId: 'MESSAGING_SENDER_ID_GOES_HERE',
  appId: 'APP_ID_GOES_HERE',
};

// Default form field and data values
export const defaults: AppDefaults = {
  countsCollection: 'counts',                           // Name of collection for Line Counts in Firebase.
  samplesCollection: 'samples',                         // Name of collection for Line Counts in Firebase.
  dateEncodedFormat: 'yyyyMMddHHmm',                    // Format for dates when encoded in IDs for database records.
  dateDisplayFormat: 'MM/dd/yyyy, hh:mm aa',            // Format for dates when displayed to user.
  numCopies: 2,                                         // Default number of copies of labels to print. Can be overridden by user setting.
  cameraType: 'back' as CameraType,                     // Which camera to use for capturing bar codes. Can be overridden by user setting.
  locationId: '0000',                                   // Default location ID. Can be overridden by user setting.
  lineCountRegex: /^[\d]{4}-[\d]{12}$/,                 // ID format for Line Count records.
  qrCodeRegex: /^[\d]{9}-[a-zA-Z]+-[\d]{12}-[\d]{4}$/,  // ID format for QR Code records.
  barCodeNumLength: 9,                                  // Number of digits in Bar Code.
  barCodeRegex: /^[\d]{14}$|^[\d]{9}$/,                 // Pattern for Bar Code data. Scanned barcodes will be either 9 or 14 digits long.
                                                        // Manually-entered ID numbers will be exactly 9 digits long.
}
