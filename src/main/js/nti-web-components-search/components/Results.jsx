import React from 'react';

import Hit from './Hit';

export default class SearchResults extends React.Component {
	static propTypes = {
		hits: React.PropTypes.arrayOf(React.PropTypes.object),
		getBreadCrumb: React.PropTypes.func
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
		const {getBreadCrumb} = this.props;

		return (
			<Hit key={index} hit={hit} getBreadCrumb={getBreadCrumb}/>
		);
	}
}
