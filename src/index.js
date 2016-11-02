import React, { Component } from 'react';

const cache = {};

const connect = (mapStorageToProps) => {
	return (ComponentToWrap) => {
		class ConnectedComponent extends Component {
			state = {};

			componentWillMount() {
				this.obtainDownloadURLsFromCache(this.props);
			}

			componentDidMount() {
				this.updateCacheWithDownloadURLs(this.props);
			}

			componentWillReceiveProps(next) {
				this.obtainDownloadURLsFromCache(next);
				this.updateCacheWithDownloadURLs(next);
			}

			obtainDownloadURLsFromCache(props) {
				const mapping = mapStorageToProps(props);
				const keys = Object.keys(mapping);
				const newState = {}; // Holds the updated state

				for (let i = keys.length - 1; i >= 0; --i) {

					// Only check keys that have a mapping value
					if (!mapping[keys[i]]) {
						continue;
					}

					// Check cache based on full path
					const url = cache[mapping[keys[i]].fullPath];
					if (url) {
						// Add url to new state
						newState[keys[i]] = url;
					}
				}
				this.setState(newState);
			}

			updateCacheWithDownloadURLs(props) {
				const mapping = mapStorageToProps(props);
				const keys = Object.keys(mapping);
				const newState = {}; // Holds the updated state

				Promise.all(keys.map(prop => {

					// Only check keys that have a mapping value
					if (!mapping[prop]) {
						return;
					}

					// Ignore if already in cache
					if(cache[mapping[prop].fullPath]) {
						return;
					}

					return mapping[prop].getDownloadURL()
						.then((url) => {
							// Save url in cache and new state
							cache[mapping[prop].fullPath] = url;
							newState[prop] = url;
						});
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