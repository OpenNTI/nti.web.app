import React from 'react';
import cx from 'classnames';

import Fragments from './Fragments';
import Path from './Path';

import {
	initComponent,
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
		this.state = {loaded: false};
	}

	componentDidMount () {
		const {hit, getBreadCrumb} = this.props;

		initComponent(hit);

		Promise.all([
			resolveTitle(hit, getBreadCrumb),
			resolveFragments(hit),
			resolvePath(hit, getBreadCrumb),
			resolveContainerID(hit)
		]).then((results) => {
			const title = results[0];
			const fragments = results[1];
			const path = results[2];
			const containerID = results[3];

			this.setState({
				loaded: true,
				title,
				fragments,
				path,
				containerID
			});
		});
	}

	render () {
		const {title, fragments, path, loaded} = this.state;
		const {hit, navigateToSearchHit} = this.props;
		const cls = cx('search-result-react', {loaded});

		return (
			<div className={cls}>
				<div className="hit-title">{title}</div>
				<Fragments fragments={fragments} hit={hit} navigateToSearchHit={navigateToSearchHit} />
				<Path pathObject={path} />
			</div>
		);
	}
}
