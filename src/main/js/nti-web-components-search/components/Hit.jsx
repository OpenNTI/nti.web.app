import React from 'react';

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
	return (
		<div className="search-result-react">
			<div className="hit-title">{title}</div>
			<Fragments fragments={fragments} hit={hit} navigateToSearchHit={navigateToSearchHit} />
			<Path pathObject={path} />
		</div>
	);
}
