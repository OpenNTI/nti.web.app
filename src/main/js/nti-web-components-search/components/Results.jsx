import React from 'react';
import cx from 'classnames';

import {
	initComponent,
	resolveTitle,
	resolveFragments,
	resolvePath,
	resolveContainerID
} from '../resolvers';

import Hit from './Hit';

function loadHitData (hit) {
	const {getBreadCrumb} = this.props;

	initComponent(hit);
	return Promise.all(
		resolveTitle(hit, getBreadCrumb),
		resolveFragments(hit),
		resolvePath(hit, getBreadCrumb),
		resolveContainerID(hit)
	).then((results) => {
		return {
			hit,
			title: results[0],
			fragments: results[1],
			path: results[2],
			containerID: results[3],
		};
	});
}

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

	constructor (props) {
		super(props);
		this.state = {loaded: false, hits: []};
		const {showLoading, hits = []} = this.props;

		if(!showLoading) {
			this.getHitData(hits);
		}
	}

	componentDidUpdate (prevProps, prevState) {
		if(prevProps.showLoading !== this.props.showLoading) {
			const {hits = []} = this.props;
console.log(hits);
			this.getHitData(hits);
		}
	}

	getHitData (hits) {
		Promise.all(hits.map(loadHitData))
		.then(results => {
			this.setState({loaded: true, hits: results});
		});
	}

	render () {
		const {loaded, hits} = this.state;
		const {showLoading, showNext, errorLoadingText, emptyText, showMoreButton} = this.props;
		const cls = cx('search-results', {loaded});

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
				<div className={cls}>
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
		const {navigateToSearchHit} = this.props;

		return (
			<Hit hit={hit.hit} title={hit.title} key={index} fragments={hit.fragments} path={hit.path} containerID={hit.containerID} getBreadCrumb={hit.getBreadCrumb} navigateToSearchHit={navigateToSearchHit}/>
		);
	}
}
