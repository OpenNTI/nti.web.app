import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {scoped} from 'nti-lib-locale';
import {searchable} from 'nti-web-search';
import {Loading} from 'nti-web-commons';
import {LinkTo} from 'nti-web-routing';// eslint-disable-line

import Store from './Store';
import Item from './Item';

const DEFAULT_TEXT = {
	loadNextPage: 'Load More'
};
const t = scoped('nti-site-admin.users.list', DEFAULT_TEXT);

const store = new Store();
const propMap = {
	items: 'items',
	searchTerm: 'searchTerm',
	loading: 'loading',
	hasNextPage: 'hasNextPage',
	loadingNextPage: 'loadingNextPage'
};

@searchable(store, propMap)
export default class UserListView extends React.Component {
	static propTypes = {
		items: PropTypes.array,
		searchTerm: PropTypes.string,
		loading: PropTypes.bool,
		hasNextPage: PropTypes.bool,
		loadingNextPage: PropTypes.bool
	}


	componentDidMount () {
		store.load();
	}


	onLoadNextPage = () => {
		const {hasNextPage, loadingNextPage} = this.props;

		if (hasNextPage && !loadingNextPage) {
			store.loadNextPage();
		}
	}


	render () {
		const {searchTerm, loading} = this.props;

		return (
			<div className="site-admin-user-list">
				{searchTerm && (this.renderSearchTerm())}
				{loading && (<div className="loading-mask"><Loading.Mask /></div>)}
				{!loading && (this.renderItems())}
				{!loading && (this.renderLoadNext())}
			</div>
		);
	}


	renderItems () {
		const {items} = this.props;

		return (
			<ul>
				{items.map((user) => {
					return (
						<li key={user.NTIID}>
							<LinkTo.Object object={user}>
								<Item item={user} />
							</LinkTo.Object>
						</li>
					);
				})}
			</ul>
		);
	}


	renderLoadNext () {
		const {hasNextPage, loadingNextPage} = this.props;

		if (!hasNextPage && !loadingNextPage) { return null; }

		return (
			<div className={cx('load-next-page', {loading: loadingNextPage})} onClick={this.onLoadNextPage}>
				<span>
					{loadingNextPage && (<Loading.Spinner white />)}
					{hasNextPage && !loadingNextPage && t('loadNextPage')}
				</span>
			</div>
		);
	}
}
