import React from 'react';

import { Error } from '@nti/web-commons';

export class ErrorBoundary extends React.Component {
	state = {};

	componentDidCatch(error) {
		this.setState({ error });
	}

	render() {
		const { error } = this.state;
		const { children } = this.props;

		return error ? <Error error={error} key={Date.now()} /> : children;
	}
}
