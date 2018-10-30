import React from 'react';
import PropTypes from 'prop-types';
import {Table, Loading, Prompt} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import {Connectors} from '@nti/lib-store';

import Pager from '../../../common/Pager';
import SearchInfo from '../../../common/SearchInfo';

import {Name, JoinDate, LastSeen, Select} from './columns';
import ChangeRole from './ChangeRole';
import EmptyState from './EmptyState';

const t = scoped('nti-web-site-admin.users.list.table.UsersTable', {
	learners: 'Active Learners',
	selected: '%(numSelected)s Selected',
	changeRole: 'Change Role',
	emptyMessage: 'There are no active learners'
});

export default
@Connectors.Any.connect({
	loading: 'loading',
	items: 'items',
	error: 'error',
	sortOn: 'sortOn',
	sortDirection: 'sortDirection',
	selectedUsers: 'selectedUsers',
	pageNumber: 'pageNumber',
	numPages: 'numPages',
	currentSearchTerm: 'currentSearchTerm',
	setSort: 'setSort'
})
class UsersTable extends React.Component {
	static propTypes = {
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
		emptyMessage: PropTypes.string,
		currentSearchTerm: PropTypes.string,
		setSort: PropTypes.func,
		store: PropTypes.object.isRequired
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
		this.props.setSort(sortKey, sortDirection);
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
		const {sortOn, sortDirection, items, selectedUsers, error, loading, numPages, pageNumber, emptyMessage, currentSearchTerm, filter} = this.props;
		const {showChangeRoles} = this.state;

		return (
			<div className="users-table-container">
				{loading && <Loading.Mask/>}
				{!loading && error && <div className="error">{error}</div>}
				{!error && !loading && <SearchInfo searchTerm={currentSearchTerm}/>}
				{!error && !loading && (!items || items.length === 0) && <EmptyState message={emptyMessage}/>}
				{!error && !loading && items && items.length > 0 && (
					<div>
						{this.renderHeader()}
						<Table.Table
							items={items || []}
							sortDirection={sortDirection}
							sortOn={sortOn}
							columns={this.columns}
							onSortChange={this.onSortChange}
							store={{filter}}
						/>
						<Pager numPages={numPages} pageNumber={pageNumber}/>
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
