# react-firebase-storage-connector
Gives a cached download URL of a firebase storage reference as a prop to your components.

## Usage
### Step 1
Make sure you have initialized firebase somewhere in your app using:
``` javascript
import firebase from 'firebase';

const config = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
  storageBucket: "<BUCKET>.appspot.com",
};
firebase.initializeApp(config);
```
### Step 2
Connect your component:
``` javascript
import React from 'react';
import firebase from 'firebase';
import { connect } from 'react-firebase-storage-connector';

type Props = {
    imageName?: string, // The name of the image that is used to obtain a download url from the storage
    imageURL?: string // The url that is obtained using the connector
}

const ProfilePicture = (props: Props) => <img src={props.imageURL} />;

// Define a function that maps a storage reference to a prop
const mapStorageToProps = (props: Props) => ({
    imageURL: props.imageName && firebase.storage().ref('images').child(props.imageName)
});

// Export the connected component
export default connect(mapStorageToProps)(ProfilePicture);
```
## Explanation
After the component is mounted, a download URL will be requested from firebase using the storage reference.
This download URL can be used for example to download images from firebase.
The URL will be cached using the full path of the firebase storage reference,
therefore each subsequent call will obtain the download URL from the cache before the first render of the connected component.
Hence the image will be rendered immediately.
