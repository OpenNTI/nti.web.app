import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {searchable, contextual, ContextIndicator} from 'nti-web-search';
import {Loading, EmptyState} from 'nti-web-commons';
import {LinkTo} from 'nti-web-routing';// eslint-disable-line

import LoadMore from '../../common/LoadMore';
import ErrorMessage from '../../common/ErrorMessage';

import Store from './Store';
import Item from './Item';

const DEFAULT_TEXT = {
	loadNextPage: 'Load More',
	users: 'Users',
	empty: 'No Users',
	emptySearch: 'No Users found. Please refine your search.',
	shortSearch: 'Too many results. Please refine your search.',
	backLabel: 'View All Users',
	error: 'Unable to load Users.'
};
const t = scoped('nti-site-admin.users.list', DEFAULT_TEXT);

const store = new Store();
const propMap = {
	items: 'items',
	searchTerm: 'searchTerm',
	loading: 'loading',
	hasNextPage: 'hasNextPage',
	loadingNextPage: 'loadingNextPage',
	error: 'error'
};

@contextual(t('users'))
@searchable(store, propMap)
export default class UserListView extends React.Component {
	static propTypes = {
		items: PropTypes.array,
		searchTerm: PropTypes.string,
		loading: PropTypes.bool,
		hasNextPage: PropTypes.bool,
		loadingNextPage: PropTypes.bool,
		error: PropTypes.any
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
		const {loading, error} = this.props;

		return (
			<div className="site-admin-user-list">
				<ContextIndicator className="context-indicator" backLabel={t('backLabel')} />
				{loading && (<div className="loading-mask"><Loading.Mask /></div>)}
				{!loading && (this.renderItems())}
				{!loading && !error && (this.renderLoadNext())}
				{error && (this.renderError())}
			</div>
		);
	}


	renderItems () {
		const {items} = this.props;

		if (!items.length) {
			return this.renderEmptyState();
		}

		return (
			<ul>
				{items.map((user) => {
					return (
						<li key={user.NTIID}>
							<LinkTo.Object object={user} context="site-admin.users-list-item">
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

		return (
			<LoadMore hasMore={hasNextPage} loading={loadingNextPage} onLoadMore={this.onLoadNextPage} />
		);
	}


	renderEmptyState () {
		const {searchTerm} = this.props;
		const header = searchTerm ?
			(searchTerm.length < 3 ? t('shortSearch') : t('emptySearch')) :
			t('empty');

		return (
			<EmptyState header={header} />
		);
	}


	renderError () {
		return (
			<ErrorMessage>
				{t('error')}
			</ErrorMessage>
		);
	}
}
