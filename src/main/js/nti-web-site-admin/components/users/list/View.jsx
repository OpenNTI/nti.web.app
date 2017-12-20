import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {searchable, contextual} from 'nti-web-search';
import {EmptyState} from 'nti-web-commons';
import {LinkTo} from 'nti-web-routing';

import SearchablePagedView from '../../common/SearchablePagedView';

import Store from './Store';
import Item from './Item';

const DEFAULT_TEXT = {
	users: 'Users',
	empty: 'No Users',
	emptySearch: 'No Users found. Please refine your search.',
	shortSearch: 'Too many results. Please refine your search.',
	backLabel: 'View All Users',
	error: 'Unable to load Users.'
};
const t = scoped('nti-site-admin.users.list', DEFAULT_TEXT);

const store = new Store();//FIXME: I would prefer if the store could be constructed on first use/mount... instead of statically.
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
		searchTerm: PropTypes.string,
		hasNextPage: PropTypes.bool,
		loadingNextPage: PropTypes.bool
	}


	componentDidMount () {
		store.load();
	}


	onLoadNextPage = () => {
		store.loadNextPage();
	}


	render () {
		return (
			<SearchablePagedView
				{...this.props}
				className="site-admin-user-list"
				renderEmptyState={this.renderEmptyState}
				loadNextPage={this.onLoadNextPage}
				renderItem={this.renderItem}
				getString={t}
			/>
		);
	}


	renderItem = (item) => {
		return (
			<LinkTo.Object object={item} context="site-admin.users-list-item">
				<Item item={item} />
			</LinkTo.Object>
		);
	}


	renderEmptyState = () => {
		const {searchTerm} = this.props;
		const header = searchTerm ?
			(searchTerm.length < 3 ? t('shortSearch') : t('emptySearch')) :
			t('empty');

		return (
			<EmptyState header={header} />
		);
	}
}
