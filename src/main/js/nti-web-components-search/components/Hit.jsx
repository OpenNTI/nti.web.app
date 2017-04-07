import React from 'react';

import Fragments from './Fragments';
import Path from './Path';

export default class Hit extends React.Component {
	static propTypes = {
		hit: React.PropTypes.object.isRequired,
		title: React.PropTypes.string,
		fragments: React.PropTypes.arrayOf(React.PropTypes.object),
		path: React.PropTypes.arrayOf(React.PropTypes.object),
		navigateToSearchHit: React.PropTypes.func
	}

	constructor (props) {
		super(props);
		this.state = {};
	}

	render () {
		const {hit, title, fragments, path, navigateToSearchHit} = this.props;

		return (
			<div className="search-result-react">
				<div className="hit-title">{title}</div>
				<Fragments fragments={fragments} hit={hit} navigateToSearchHit={navigateToSearchHit} />
				<Path pathObject={path} />
			</div>
		);
	}
}
