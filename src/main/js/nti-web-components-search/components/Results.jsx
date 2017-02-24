import React from 'react';

import Hit from './Hit';

export default class SearchResults extends React.Component {
	static propTypes = {
		hits: React.PropTypes.arrayOf(React.PropTypes.object),
		getBreadCrumb: React.PropTypes.func,
		navigateToSearchHit: React.PropTypes.func,
		gotoPage: React.PropTypes.func,
		currentPage: React.PropTypes.number,
		totalPages: React.PropTypes.number
	}

	render () {
		const {hits = []} = this.props;

		return (
			<div className="search-results">
				{hits.map(this.renderHit)}
			</div>
		);
	}

	renderHit = (hit, index) => {
		const {getBreadCrumb, navigateToSearchHit} = this.props;

		return (
			<Hit key={index} hit={hit} getBreadCrumb={getBreadCrumb} navigateToSearchHit={navigateToSearchHit}/>
		);
	}
}
