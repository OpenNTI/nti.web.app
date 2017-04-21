import React from 'react';

import {
	resolveNavigateToSearchHit
} from '../resolvers';

import Fragments from './Fragments';
import Path from './Path';

Hit.propTypes = {
	hit: React.PropTypes.object.isRequired,
	title: React.PropTypes.string,
	fragments: React.PropTypes.arrayOf(React.PropTypes.object),
	path: React.PropTypes.arrayOf(React.PropTypes.object),
	navigateToSearchHit: React.PropTypes.func
};

export default function Hit ({hit, title, fragments, path, navigateToSearchHit}) {

	function navigate () {
		resolveNavigateToSearchHit(hit, fragments[0])
			.then(({obj, fragIndex, containerId}) => {
				return navigateToSearchHit(obj, hit, fragIndex, containerId);
			});
	}

	return (
		<div className="search-result-react">
			<div className="hit-title" onClick={navigate}>{title}</div>
			<Fragments fragments={fragments} hit={hit} navigateToSearchHit={navigateToSearchHit} />
			<Path pathObject={path} />
		</div>
	);
}
