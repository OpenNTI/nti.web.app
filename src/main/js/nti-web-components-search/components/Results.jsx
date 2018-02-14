import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import {
	initComponent,
	resolveTitle,
	resolveFragments,
	resolvePath
} from '../resolvers';

import Hit from './Hit';
import Pager from './Pager';
import UserList from './UserList';

function loadHitData (hit, getBreadCrumb) {

	initComponent(hit);

	return Promise.all([
		resolveTitle(hit, getBreadCrumb),
		resolveFragments(hit)
	]).then((results) => {
		return {
			hit,
			title: results[0],
			fragments: results[1],
			resolvePath: () => { return resolvePath(hit, getBreadCrumb); }
		};
	});
}

export default class SearchResults extends React.Component {
	static propTypes = {
		hits: PropTypes.arrayOf(PropTypes.object),
		getBreadCrumb: PropTypes.func,
		navigateToSearchHit: PropTypes.func,
		showNext: PropTypes.func,
		loadPage: PropTypes.func,
		errorLoadingText: PropTypes.string,
		emptyText: PropTypes.string,
		showMoreButton: PropTypes.bool,
		showLoading: PropTypes.bool,
		currentPage: PropTypes.number,
		numPages: PropTypes.number,
		onResultsLoaded: PropTypes.func,
		currentTab: PropTypes.string,
		updateRoute: PropTypes.func
	}

	constructor (props) {
		super(props);
		this.state = {loaded: false, hits: []};
		const {showLoading, hits = []} = this.props;

		if(!showLoading) {
			this.getHitData(hits);
		}
	}

	componentDidUpdate (prevProps) {
		if(prevProps.hits !== this.props.hits) {
			const {hits = [], getBreadCrumb} = this.props;
			this.setState({loaded: false, navigating: false, hits: []});
			this.getHitData(hits, getBreadCrumb);
		}
	}

	getHitData (hits, getBreadCrumb) {
		Promise.all(hits.map(hit => loadHitData(hit, getBreadCrumb)))
			.then(results => {
				this.setState({loaded: true, hits: results});

				if(!this.props.showLoading) {
					this.props.onResultsLoaded();
				}
			});
	}

	render () {
		const {loaded, navigating, hits} = this.state;
		const {showLoading, errorLoadingText, emptyText, numPages, currentTab, updateRoute} = this.props;
		const cls = cx('search-results', {loaded});
		let hitItems = [], userSearch;

		const loadingMessage = navigating ? 'Navigating...' : 'Loading...';

		hits.map((item) => {
			if (item.hit && item.hit.Class === 'User') {
				userSearch = item.hit.Items ? item.hit.Items : [];
			}
			else {
				hitItems.push(item);
			}
		});

		let showEmpty = hitItems.length === 0;

		if(currentTab === 'all' || currentTab === 'people') {
			if(userSearch && userSearch.length > 0) {
				showEmpty = false;
			}
		}

		if(navigating || showLoading || !loaded) {
			return (
				<div className="search-results">
					<div className="loading-container control-item">
						<div className="loading">{loadingMessage}</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className={cls}>
					{userSearch && (
						<UserList currentTab={currentTab} userList={userSearch} updateRoute={updateRoute}/>
					)}
					{hitItems.map(this.renderHit)}
					{loaded && !errorLoadingText && numPages > 1 &&
						this.renderPages(numPages)
					}
					{errorLoadingText &&
						<div className="error control-item">{errorLoadingText}</div>
					}
					{showEmpty &&
						<div className="empty control-item">{emptyText}</div>
					}
				</div>
			);
		}
	}

	onNavigation = (obj, h, fragIndex, containerId) => {
		this.setState({ navigating: true });

		this.props.navigateToSearchHit(obj, h, fragIndex, containerId);
	}

	renderHit = (hit, index) => {
		return (
			<Hit hit={hit.hit} title={hit.title} key={index} fragments={hit.fragments} resolvePath={hit.resolvePath} navigateToSearchHit={this.onNavigation}/>
		);
	}

	renderPages = (pagesToShow) => {
		const {currentPage, showNext, loadPage, showMoreButton} = this.props;

		return (
			<Pager pagesToShow={pagesToShow} currentPage={currentPage} showNext={showNext} loadPage={loadPage} showMoreButton={showMoreButton}/>
		);
	}
}
