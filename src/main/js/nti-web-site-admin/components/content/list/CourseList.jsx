import React from 'react';
import PropTypes from 'prop-types';
import {searchable} from 'nti-web-search';

import List from './List';
import Store from './CourseStore';

const store = new Store();//FIXME: I would prefer if the store could be constructed on first use/mount... instead of statically.
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
export default class CourseListView extends React.Component {
	static propTypes = {
		searchTerm: PropTypes.string,
		hasNextPage: PropTypes.bool,
		loadNextPage: PropTypes.func,
		loadingNextPage: PropTypes.bool,
		store: PropTypes.object
	}

	componentDidMount () {
		store.load();
	}

	render () {
		return (
			<List {...this.props}/>
		);
	}
}