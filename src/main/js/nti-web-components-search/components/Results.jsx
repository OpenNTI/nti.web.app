import React from 'react';
import cx from 'classnames';

import {
	initComponent,
	resolveTitle,
	resolveFragments,
	resolvePath
} from '../resolvers';

import Hit from './Hit';
import Pager from './Pager';

function loadHitData (hit, getBreadCrumb) {

	initComponent(hit);

	return Promise.all([
		resolveTitle(hit, getBreadCrumb),
		resolveFragments(hit),
		resolvePath(hit, getBreadCrumb)
	]).then((results) => {
		return {
			hit,
			title: results[0],
			fragments: results[1],
			path: results[2]
		};
	});
}

export default class SearchResults extends React.Component {
	static propTypes = {
		hits: React.PropTypes.arrayOf(React.PropTypes.object),
		getBreadCrumb: React.PropTypes.func,
		navigateToSearchHit: React.PropTypes.func,
		showNext: React.PropTypes.func,
		loadPage: React.PropTypes.func,
		errorLoadingText: React.PropTypes.string,
		emptyText: React.PropTypes.string,
		showMoreButton: React.PropTypes.bool,
		showLoading: React.PropTypes.bool,
		currentPage: React.PropTypes.number,
		numPages: React.PropTypes.number
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
		if(prevProps.hits !== this.props.hits) {
			this.state = {loaded: false, hits: []};
			const {hits = [], getBreadCrumb} = this.props;
			this.getHitData(hits, getBreadCrumb);
		}
	}

	getHitData (hits, getBreadCrumb) {
		Promise.all(hits.map(hit => loadHitData(hit, getBreadCrumb)))
		.then(results => {
			this.setState({loaded: true, hits: results});
		});
	}

	render () {
		const {loaded, hits} = this.state;
		const {showLoading, errorLoadingText, emptyText, numPages} = this.props;
		const cls = cx('search-results', {loaded});

		if(showLoading || !loaded) {
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
					{loaded && !errorLoadingText && !emptyText && numPages > 1 &&
						this.renderPages(numPages)
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
			<Hit hit={hit.hit} title={hit.title} key={index} fragments={hit.fragments} path={hit.path} navigateToSearchHit={navigateToSearchHit}/>
		);
	}

	renderPages = (pagesToShow) => {
		const {currentPage, showNext, loadPage, showMoreButton} = this.props;

		return (
			<Pager pagesToShow={pagesToShow} currentPage={currentPage} showNext={showNext} loadPage={loadPage} showMoreButton={showMoreButton}/>
		);
	}
}
