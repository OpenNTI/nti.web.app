import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {scoped} from 'nti-lib-locale';
import {searchable, contextual, ContextIndicator} from 'nti-web-search';
import {Loading, EmptyState} from 'nti-web-commons';
import {LinkTo} from 'nti-web-routing';// eslint-disable-line

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
				{!loading && (this.renderLoadNext())}
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
			<div className="error">
				{t('error')}
			</div>
		);
	}
}
