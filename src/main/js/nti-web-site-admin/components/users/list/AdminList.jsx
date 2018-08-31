import React from 'react';
import PropTypes from 'prop-types';
import {searchable, contextual} from '@nti/web-search';
import {Prompt} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import List from './List';
import Store from './AdminStore';

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
	users: 'Admin'
};
const t = scoped('nti-site-admin.users.adminlist', DEFAULT_TEXT);

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

export default
@searchable(store, propMap)
@contextual(t('users'))
class AdminListView extends React.Component {
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
