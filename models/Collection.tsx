import * as firebase from 'firebase';
import 'firebase/firestore';

export interface CollectionMeta {
  firebaseCollection: firebase.firestore.CollectionReference;
  keyRegex: RegExp;
  label: string;
  unsubscribe: () => void;
}
