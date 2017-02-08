import React from 'react';

import Fragments from './Fragments';

import {
	resolveTitle,
	resolveFragments
	// resolvePath,
	// resolveContainerID
} from '../resolvers';



export default class Hit extends React.Component {
	static propTypes = {
		hit: React.PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);

		this.state = {};
	}

	componentDidMount () {
		const {hit} = this.props;

		resolveTitle(hit)
			.then((title) => {
				this.setState({title});
			});

		resolveFragments(hit).then((fragments) => {
			this.setState({fragments});
		});
		//
		// resolvePath(hit).then((path) => {
		// 	this.setState({path});
		// });
		//
		// resolveContainerID(hit).then((containerID) => {
		// 	this.setState({containerID});
		// });
	}

	render () {
		const {title, fragments, path, containerID, navObject} = this.state;
		// const isLoading = !title;

		return (
			<div className="search-result">
				<div className="title">{title}</div>
				<span className="list-item creator" />
				<Fragments fragments={fragments} />
			</div>

		);
	}
}
