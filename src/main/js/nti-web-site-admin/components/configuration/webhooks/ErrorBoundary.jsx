import React from 'react';

import { Error } from '@nti/web-commons';

export class ErrorBoundary extends React.Component {
	state = {};

	static getDerivedStateFromError(error) {
		return { error };
	}

	componentDidCatch(error) {
		this.setState({ error });
	}

	render() {
		const { error } = this.state;
		const { children, fallback } = this.props;

		if (error && fallback) {
			return React.cloneElement(fallback, { error });
		}

		return error ? <Error error={error} key={Date.now()} /> : children;
	}
}
