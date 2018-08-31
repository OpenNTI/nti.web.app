import React from 'react';
import PropTypes from 'prop-types';
import {searchable} from '@nti/web-search';

import List from './List';
import Store from './CourseStore';

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

export default
@searchable(store, propMap)
class CourseListView extends React.Component {
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
