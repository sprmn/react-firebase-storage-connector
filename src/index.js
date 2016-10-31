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

			getURLFromCache = (mapping, prop) => {
				if (mapping[prop]) {
					const fullPath = mapping[prop].fullPath;
					const cachedURL = cache[fullPath];
					return cachedURL;
				}
			}

			getURLFromFirebase = async (mapping, prop) => {
				if (mapping[prop]) {
					try {
						const downloadURL = await mapping[prop].getDownloadURL();
						return downloadURL;
					}
					catch (error) {
						console.log(error);
					}
				}
			}

			obtainDownloadURLs = async (props, options = {}) => {
				const {cacheOnly, firebaseOnly} = options;
				const mapping = mapStorageToProps(props);
				const keys = Object.keys(mapping);
				for (let i = keys.length - 1; i >= 0; --i) {
					const prop = keys[i];
					let url;
					if (!firebaseOnly) {
						url = this.getURLFromCache(mapping, prop);
					}
					if (!url && !cacheOnly) {
						url = await this.getURLFromFirebase(mapping, prop);
						// Update cache
						if (url) {
							const fullPath = mapping[prop].fullPath;
							cache[fullPath] = url;
						}
					}
					// Update state
					const newState = {};
					newState[prop] = url;
					this.setState(newState);
				}
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