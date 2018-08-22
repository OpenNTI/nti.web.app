import React from 'react';
import PropTypes from 'prop-types';
import {Table, Loading, Prompt} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import {searchable} from '@nti/web-search';

import {Name, JoinDate, LastSeen, Select} from './columns';
import Store from './Store';
import Pager from './Pager';
import ChangeRole from './ChangeRole';
import EmptyState from './EmptyState';

const t = scoped('nti-web-site-admin.users.list.table.UsersTable', {
	learners: 'Active Learners',
	selected: '%(numSelected)s Selected',
	changeRole: 'Change Role',
	emptyMessage: 'There are no active learners'
});

export default
@searchable()
@Store.connect({
	loading: 'loading',
	items: 'items',
	error: 'error',
	sortOn: 'sortOn',
	sortDirection: 'sortDirection',
	selectedUsers: 'selectedUsers',
	pageNumber: 'pageNumber',
	numPages: 'numPages'
})
class UsersTable extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		items: PropTypes.array,
		error: PropTypes.string,
		loading: PropTypes.bool,
		sortOn: PropTypes.string,
		sortDirection: PropTypes.string,
		pageNumber: PropTypes.number,
		numPages: PropTypes.number,
		selectedUsers: PropTypes.array,
		filter: PropTypes.string,
		title: PropTypes.string,
		emptyMessage: PropTypes.string
	}

	items = []

	columns = [
		Select,
		Name,
		JoinDate,
		LastSeen
	]

	state = {
		sortDirection: Table.ASCENDING,
		sortOn: 'name'
	}

	// componentDidMount () {
	// 	this.props.store.load();
	// }

	onSortChange = (sortKey, sortDirection) => {
		this.props.store.setSort(sortKey, sortDirection);
	}

	showChangeRolesDialog = () => {
		this.setState({showChangeRoles: true});
	}

	hideChangeRolesDialog = () => {
		this.setState({showChangeRoles: false});
	}

	renderControls () {
		return (
			<div className="controls">
				<div className="button change-role" onClick={this.showChangeRolesDialog}>{t('changeRole')}</div>
			</div>
		);
	}

	renderHeader () {
		const {selectedUsers, title} = this.props;

		const numSelected = selectedUsers && selectedUsers.length;

		return (
			<div className="header">
				<div className="title">{numSelected ? t('selected', { numSelected }) : title}</div>
				{numSelected > 0 && this.renderControls()}
			</div>
		);
	}

	render () {
		const {store, sortOn, sortDirection, items, selectedUsers, error, loading, numPages, pageNumber, emptyMessage, filter} = this.props;
		const {showChangeRoles} = this.state;

		return (
			<div className="users-table-container">
				{loading && <Loading.Mask/>}
				{!loading && error && <div className="error">{error}</div>}
				{!error && !loading && (!items || items.length === 0) && <EmptyState message={emptyMessage}/>}
				{!loading && items && items.length > 0 && (
					<div>
						{this.renderHeader()}
						<Table.Table
							store={store}
							items={items || []}
							sortDirection={sortDirection}
							sortOn={sortOn}
							columns={this.columns}
							onSortChange={this.onSortChange}
						/>
						<Pager store={store} numPages={numPages} pageNumber={pageNumber}/>
					</div>
				)}
				{showChangeRoles && (
					<Prompt.Dialog onBeforeDismiss={this.hideChangeRolesDialog}>
						<ChangeRole selectedUsers={selectedUsers} removing={filter === 'admin'}/>
					</Prompt.Dialog>
				)}
			</div>
		);
	}
}
