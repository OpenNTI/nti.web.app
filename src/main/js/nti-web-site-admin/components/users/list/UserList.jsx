import React from 'react';
import {searchable} from 'nti-web-search';

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

@searchable(store, propMap)
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
