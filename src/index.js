import React, { Component } from 'react';

const cache = {};

const connect = (mapStorageToProps) => {
	return (ComponentToWrap) => {
		class ConnectedComponent extends Component {
			state = {};

			componentWillMount() {
				this.obtainDownloadURLs(this.props, {cacheOnly: true});
			}

			componentDidMount() {
				this.obtainDownloadURLs(this.props, {firebaseOnly: true});
			}

			componentWillReceiveProps(next) {
				this.obtainDownloadURLs(next);
			}

			obtainDownloadURLs = (props, options = {}) => {
				const {cacheOnly, firebaseOnly} = options;
				const mapping = mapStorageToProps(props);
				const keys = Object.keys(mapping);
				const newState = {}; // Holds the updated state

				Promise.all(keys.map(prop => {
					// Only obtain URL if mapping is defined
					if (!mapping[prop]) {
						return null;
					}
					const fullPath = mapping[prop].fullPath;

					if (!firebaseOnly) {
						const url = cache[fullPath];
						if (url) {
							// Add url to new state
							newState[prop] = url;
							return url;
						}
					}

					if (!cacheOnly) {
						return mapping[prop].getDownloadURL()
							.then((url) => {
								// Save url in cache and new state
								newState[prop] = cache[fullPath] = url;
								return url;
							});
					}

					return null;
				}))
					.then(() => this.setState(newState))
					.catch(console.error);
			}

			render() {
				return <ComponentToWrap {...this.state} {...this.props} />;
			}
		};
		return ConnectedComponent;
	}
}

export {
	connect
};