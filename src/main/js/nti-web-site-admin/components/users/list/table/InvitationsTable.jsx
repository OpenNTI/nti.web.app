import React from 'react';
import PropTypes from 'prop-types';
import {Table, Loading, Prompt} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import {Select, InviteDate, InviteName} from './columns';
import Store from './InvitationsStore';
import Pager from './Pager';
import EmptyState from './EmptyState';

const t = scoped('nti-web-site-admin.users.list.table.InvitationsTable', {
	learners: 'Invitations',
	selected: '%(numSelected)s Selected',
	rescind: 'Rescind Invitation',
	emptyMessage: 'There are no outstanding invitations'
});

export default
@Store.connect({
	loading: 'loading',
	items: 'items',
	sortOn: 'sortOn',
	sortDirection: 'sortDirection',
	selectedUsers: 'selectedUsers',
	pageNumber: 'pageNumber',
	numPages: 'numPages'
})
class InvitationsTable extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		items: PropTypes.array,
		loading: PropTypes.bool,
		sortOn: PropTypes.string,
		sortDirection: PropTypes.string,
		pageNumber: PropTypes.number,
		numPages: PropTypes.number,
		selectedUsers: PropTypes.array
	}

	items = []

	columns = [
		Select,
		InviteName,
		InviteDate
	]

	state = {
		sortDirection: Table.ASCENDING,
		sortOn: 'name'
	}

	componentDidMount () {
		this.props.store.loadInvitations();
	}

	onSortChange = (sortKey, sortDirection) => {
		this.props.store.onSortChange(sortKey, sortDirection);
	}

	onRescind = () => {
		const {selectedUsers, store} = this.props;

		Prompt.areYouSure('Do you want to rescind pending invitations for the selected users?', 'Rescind Invitations', { iconClass: 'alert', confirmButtonClass: 'alert', confirmButtonLabel: 'Yes', cancelButtonLabel: 'No' }).then(() => {
			store.rescind(selectedUsers);
		});
	}

	renderControls () {
		return (
			<div className="controls">
				<div className="button rescind" onClick={this.onRescind}>{t('rescind')}</div>
			</div>
		);
	}

	renderHeader () {
		const {selectedUsers} = this.props;

		const numSelected = selectedUsers && selectedUsers.length;

		return (
			<div className="header">
				<div className="title">{numSelected ? t('selected', { numSelected }) : t('learners')}</div>
				{numSelected > 0 && this.renderControls()}
			</div>
		);
	}

	render () {
		const {store, sortOn, sortDirection, items, loading, numPages, pageNumber} = this.props;

		return (
			<div className="users-table-container invitations">
				{loading && <Loading.Mask/>}
				{!loading && (!items || items.length === 0) && <EmptyState message={t('emptyMessage')}/>}
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
			</div>
		);
	}
}
