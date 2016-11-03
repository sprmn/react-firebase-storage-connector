# react-firebase-storage-connector
Gives a cached download URL of a firebase storage reference as a prop to your components.
Works on React and React Native.

## Prerequisites
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

##### Note for React Native:
In order to cache Firebase images in React Native, make sure to configure `cacheControl` in the metadata of the images as explained [here](https://firebase.google.com/docs/storage/web/file-metadata).

## API

### `connect(mapStorageToProps)(Component)`
Connect a component to a cached firebase storage URL. In case of a simple image it is probably easier to use the `<ImageFromStorage />` component.

#### Example
``` javascript
import React from 'react';
import firebase from 'firebase';
import { connect } from 'react-firebase-storage-connector';

type Props = {
  imageName?: string, // The name of the image that is used to obtain a download url from the storage
  imageURL?: string // The url that is obtained using the connector
  children?: any
};

const ContainerWithBackgroundImage = (props: Props) => (
  <div style={{background: `url(${props.imageURL})`}}>
    {props.children}
  </div>
);

// Define a function that maps a storage reference to a prop
const mapStorageToProps = (props: Props) => ({
  imageURL: props.imageName && firebase.storage().ref('images').child(props.imageName)
});

// Export the connected component
export default connect(mapStorageToProps)(ContainerWithBackgroundImage);
```

### `<ImageFromStorage />`
A component that takes a `storageRef` and renders an image with the cached download URL obtained from this storage reference.

#### Props
- `storageRef` (required) - A reference to a Firebase storage image.
- `as` (optional) - A component to render instead of the `<img>` component. This component will receive the URL via its `src` prop.

All other props will be passed on to the `<img>` component.

#### Example
``` javascript
import React from 'react';
import firebase from 'firebase';
import { ImageFromStorage } from 'react-firebase-storage-connector';

type Props = {
  username?: string, // The username, will be used as alt prop
  imageName?: string // The name of the image that is used to obtain a download url from the storage
};

const ProfilePicture = (props: Props) => (
  <ImageFromStorage
    storageRef={props.imageName && firebase.storage().ref('images').child(props.imageName)}
    alt={props.username}
  />
);

// Export the connected component
export default ProfilePicture;
```

## Explanation
After the component is mounted, a download URL will be requested from firebase using the storage reference.
This download URL can be used for example to download images from firebase.
The URL will be cached using the full path of the firebase storage reference,
therefore each subsequent call will obtain the download URL from the cache before the first render of the connected component.
Hence the image will be rendered immediately.

## Questions
If you have any question at all, please open an [issue](https://github.com/sprmn/react-firebase-storage-connector/issues/new).