/**
 * @flow
 */

import React, {
  Component,
} from 'react';

const cache = {};

export default function connect(mapStorageToProps: (props: Object) => Object) {
  return function wrap(ComponentToWrap: any) {
    class ConnectedComponent extends Component {
      state = {};

      componentWillMount() {
        this.obtainDownloadURLsFromCache(this.props);
      }

      componentDidMount() {
        this.updateCacheWithDownloadURLs(this.props);
      }

      componentWillReceiveProps(next: Object) {
        this.obtainDownloadURLsFromCache(next);
        this.updateCacheWithDownloadURLs(next);
      }

      obtainDownloadURLsFromCache(props: Object) {
        const mapping = mapStorageToProps(props);
        const keys = Object.keys(mapping);
        const newState = {}; // Holds the updated state

        for (let i = keys.length - 1; i >= 0; i -= 1) {
          // Only check keys that have a mapping value
          if (mapping[keys[i]]) {
            // Check cache based on full path
            const url = cache[mapping[keys[i]].fullPath];
            if (url) {
              // Add url to new state
              newState[keys[i]] = url;
            }
          }
        }
        this.setState(newState);
      }

      updateCacheWithDownloadURLs(props: Object) {
        const mapping = mapStorageToProps(props);
        const keys = Object.keys(mapping);
        const newState = {}; // Holds the updated state

        Promise.all(keys.map((prop) => {
          // Only check keys that have a mapping value and that are not in cache
          if (mapping[prop] && !cache[mapping[prop].fullPath]) {
            return mapping[prop].getDownloadURL()
              .then((url) => {
                // Save url in cache and new state
                newState[prop] = cache[mapping[prop].fullPath] = url;
              });
          }
          return null;
        }))
          .then(() => this.setState(newState));
      }

      render() {
        return <ComponentToWrap {...this.state} {...this.props} />;
      }
    }
    return ConnectedComponent;
  };
}

const ImageFromStorage = connect(props => ({
  src: props.storageRef,
}))((innerprops: { as?: any, src: string, storageRef: Object, alt?: string }) => {
  const { as, alt, ...imgProps } = innerprops;
  delete imgProps.storageRef;
  if (as) {
    const Image = as;
    return <Image alt={alt} {...imgProps} />;
  }
  return <img alt={alt} {...imgProps} />;
});

export {
  connect,
  ImageFromStorage,
};
