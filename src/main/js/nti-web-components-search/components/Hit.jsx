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
		getBreadCrumb: React.PropTypes.func
	}

	constructor (props) {
		super(props);
		this.state = {};
	}

	componentDidMount () {
		const {hit} = this.props;
		const {getBreadCrumb} = this.props;

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
		// const isLoading = !title;

		return (
			<div className="search-result">
				<div className="title">{title}</div>
				<span className="list-item creator" />
				<Fragments fragments={fragments} />
				<div className="meta">
					<div className="root-icon hidden" />
					<Path pathObject={path} />
				</div>
			</div>

		);
	}
}
