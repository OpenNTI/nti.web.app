import React from 'react';

import Hit from './Hit';

export default class SearchResults extends React.Component {
	static propTypes = {
		hits: React.PropTypes.arrayOf(React.PropTypes.object),
		getBreadCrumb: React.PropTypes.func,
		navigateToSearchHit: React.PropTypes.func,
		showNext: React.PropTypes.func,
		removeNext: React.PropTypes.func,
		errorLoadingText: React.PropTypes.string,
		emptyText: React.PropTypes.string,
		showMoreButton: React.PropTypes.bool,
		showLoading: React.PropTypes.bool
	}

	render () {
		const {hits = [], showLoading, showNext, errorLoadingText, emptyText, showMoreButton} = this.props;

		if(showLoading) {
			return (
				<div className="search-results">
					<div className="loading-container control-item">
						<div className="loading">Loading...</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="search-results">
					{hits.map(this.renderHit)}
					{showMoreButton &&
						<button className="show-more-button" onClick={showNext}>Show More</button>
					}
					{errorLoadingText &&
						<div className="error control-item">{errorLoadingText}</div>
					}
					{emptyText &&
						<div className="empty control-item">{emptyText}</div>
					}
				</div>
			);
		}
	}

	renderHit = (hit, index) => {
		const {getBreadCrumb, navigateToSearchHit} = this.props;

		return (
			<Hit hit={hit} key={index} getBreadCrumb={getBreadCrumb} navigateToSearchHit={navigateToSearchHit}/>
		);
	}
}
