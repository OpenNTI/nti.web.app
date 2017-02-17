import React from 'react';

import Fragments from './Fragments';
import Path from './Path';

import {
	resolveTitle,
	resolveFragments,
	resolvePath,
	resolveContainerID
} from '../resolvers';



export default class Hit extends React.Component {
	static propTypes = {
		hit: React.PropTypes.object.isRequired,
		getBreadCrumb: React.PropTypes.func,
		navigateToSearchHit: React.PropTypes.func
	}

	constructor (props) {
		super(props);
		this.state = {};
	}

	componentDidMount () {
		const {hit, getBreadCrumb} = this.props;

		resolveTitle(hit)
			.then((title) => {
				this.setState({title});
			});

		resolveFragments(hit)
			.then((fragments) => {
				this.setState({fragments});
			});

		resolvePath(hit, getBreadCrumb)
			.then((path) => {
				this.setState({path});
			});

		resolveContainerID(hit)
			.then((containerID) => {
				this.setState({containerID});
			});
	}

	render () {
		const {title, fragments, path, containerID, navObject} = this.state;
		const {hit, navigateToSearchHit} = this.props;
		// const isLoading = !title;

		return (
			<div className="search-result">
				<div className="hit-title">{title}</div>
				<Fragments fragments={fragments} hit={hit} navigateToSearchHit={navigateToSearchHit} />
				<Path pathObject={path} />
			</div>

		);
	}
}
