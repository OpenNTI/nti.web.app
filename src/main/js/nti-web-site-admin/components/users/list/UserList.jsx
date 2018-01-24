import React from 'react';
import {searchable, contextual} from 'nti-web-search';
import {scoped} from 'nti-lib-locale';

import List from './List';
import Store from './Store';

const store = Store.getInstance();//FIXME: I would prefer if the store could be constructed on first use/mount... instead of statically.
const propMap = {
	items: 'items',
	searchTerm: 'searchTerm',
	loading: 'loading',
	hasNextPage: 'hasNextPage',
	loadingNextPage: 'loadingNextPage',
	loadNextPage: 'loadNextPage',
	error: 'error'
};

const DEFAULT_TEXT = {
	users: 'Users'
};
const t = scoped('nti-site-admin.users.adminlist', DEFAULT_TEXT);

@searchable(store, propMap)
@contextual(t('users'))
export default class UserListView extends React.Component {
	componentDidMount () {
		store.load();
	}

	render () {
		return (
			<List {...this.props}/>
		);
	}
}
