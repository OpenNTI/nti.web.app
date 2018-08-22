import React from 'react';
import PropTypes from 'prop-types';
import {Table, Loading, Prompt} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import {searchable} from '@nti/web-search';

import InvitePeople from '../InvitePeople';
import Pager from '../../../common/Pager';

import {Select, InviteDate, InviteName, Rescind} from './columns';
import Store from './InvitationsStore';
import EmptyState from './EmptyState';

const t = scoped('nti-web-site-admin.users.list.table.InvitationsTable', {
	learners: 'Invitations',
	selected: '%(numSelected)s Selected',
	rescind: 'Rescind Invitation',
	emptyMessage: 'There are no outstanding invitations',
	invitePeople: 'Invite People'
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
class InvitationsTable extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		items: PropTypes.array,
		error: PropTypes.string,
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
		InviteDate,
		Rescind
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

	onRescind = () => {
		const {selectedUsers, store} = this.props;

		Prompt.areYouSure('Do you want to rescind pending invitations for the selected users?', 'Rescind Invitations', { iconClass: 'alert', confirmButtonClass: 'alert', confirmButtonLabel: 'Yes', cancelButtonLabel: 'No' }).then(() => {
			store.rescind(selectedUsers);
		});
	}

	launchInvite = () => {
		InvitePeople.show(this.props.store);
	}

	renderControls () {
		const {selectedUsers} = this.props;
		const numSelected = (selectedUsers && selectedUsers.length) || 0;

		return (
			<div className="controls">
				{numSelected > 0 && <div className="button rescind" onClick={this.onRescind}>{t('rescind')}</div>}
				{numSelected <= 0 && <div className="button invite-people" onClick={this.launchInvite}>{t('invitePeople')}</div>}
			</div>
		);
	}

	renderHeader () {
		const {selectedUsers} = this.props;
		const numSelected = selectedUsers && selectedUsers.length;

		return (
			<div className="header">
				<div className="title">{numSelected ? t('selected', { numSelected }) : t('learners')}</div>
				{this.renderControls()}
			</div>
		);
	}

	render () {
		const {store, sortOn, sortDirection, items, error, loading, numPages, pageNumber} = this.props;

		return (
			<div className="users-table-container invitations">
				{loading && <Loading.Mask/>}
				{!loading && error && <div className="error">{error}</div>}
				{!error && !loading && (!items || items.length === 0) && <EmptyState message={t('emptyMessage')}/>}
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
