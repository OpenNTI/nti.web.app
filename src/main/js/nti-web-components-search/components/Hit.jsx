import React from 'react';

import {
	resolveNavigateToSearchHit
} from '../resolvers';

import Fragments from './Fragments';
import Path from './Path';

export default class Hit extends React.Component {
	static propTypes = {
		hit: React.PropTypes.object.isRequired,
		title: React.PropTypes.string,
		fragments: React.PropTypes.arrayOf(React.PropTypes.object),
		resolvePath: React.PropTypes.func,
		navigateToSearchHit: React.PropTypes.func
	}

	constructor (props) {
		super(props);
		this.state = {};

		if(this.props.resolvePath) {
			Promise.resolve(this.props.resolvePath())
				.then((p) => {
					this.setState({path: p});
				});
		}
	}

	navigate (hit, fragments, navigateToSearchHit) {
		resolveNavigateToSearchHit(hit, fragments[0])
			.then(({obj, fragIndex, containerId}) => {
				return navigateToSearchHit(obj, hit, fragIndex, containerId);
			});
	}

	render () {
		const { hit, fragments, navigateToSearchHit } = this.props;

		let clickHandler = () => { this.navigate(hit, fragments, navigateToSearchHit); };

		return (
			<div className="search-result-react">
				<div className="hit-title" onClick={clickHandler}>{this.props.title}</div>
				<Fragments fragments={this.props.fragments} hit={this.props.hit} navigateToSearchHit={this.props.navigateToSearchHit} />
				<Path pathObject={this.state.path} />
			</div>
		);
	}
}
