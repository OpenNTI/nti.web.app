import React from 'react';
import PropTypes from 'prop-types';
import {searchable} from 'nti-web-search';
import {Prompt} from 'nti-web-commons';

import List from './List';
import Store from './AdminStore';

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

RemoveButton.propTypes = {
	item: PropTypes.object
};
function RemoveButton ({item}) {
	const userName = item.Username;

	function onRemove (e) {
		e.stopPropagation();
		e.preventDefault();

		Prompt.areYouSure('Remove this user as a site admin?').then(() => {
			store.removeAdmin(userName);
		}).catch(() => {});
	}

	return (
		<div className="remove-as-admin" onClick={onRemove}>
			Remove as site admin
		</div>
	);
}

@searchable(store, propMap)
export default class AdminListView extends React.Component {
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
			<List {...this.props} removeCmp={RemoveButton}/>
		);
	}
}
