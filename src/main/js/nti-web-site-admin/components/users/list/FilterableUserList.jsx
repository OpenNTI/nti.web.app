import React from 'react';
import {Prompt} from 'nti-web-commons';

import Toolbar from '../../common/toolbar/Toolbar';
import AddConfirmation from '../../common/toolbar/AddConfirmation';

import UserList from './UserList';
import AdminList from './AdminList';
import AdminStore from './AdminStore';

const USERS = 'users';
const ADMINS = 'admins';

const OPTIONS = ['Users', 'Site Admins'];
const SORTERS = {
	[USERS]: ['createdTime'],
	[ADMINS]: ['createdTime']
};

const adminStore = new AdminStore();

export default class FiterableUserList extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			type: USERS,
			selectedItems: new Set()
		};
	}

	onTypeToggle = (val) => {
		if(val === 'Site Admins') {
			this.setState({type: ADMINS});
		}
		else if(val === 'Users') {
			this.setState({type: USERS});
		}
	}

	setAsAdmin = () => {
		const {selectedItems} = this.state;

		let dialog = null;

		return new Promise((fulfill, reject) => {
			dialog = Prompt.modal(
				(<AddConfirmation selectedUsers={Array.from(selectedItems)} onConfirm={fulfill} onCancel={reject}/>)
			);
		}).then(() => {
			dialog && dialog.dismiss();

			Array.from(selectedItems).forEach(item => {
				adminStore.addAdmin(item.Username);
			});

			this.setState({selectedItems: new Set()});
		}).catch(() => {
			dialog && dialog.dismiss();
		});
	}

	actionMap = {
		[USERS]: [
			{
				name: 'Set as Admin',
				handler: this.setAsAdmin
			}
		]
	}

	renderToolbar () {
		const {type, selectedItems} = this.state;

		let selectedType = OPTIONS[0];

		if(type === ADMINS) {
			selectedType = OPTIONS[1];
		}

		const actions = this.actionMap[type];
		const sorters = SORTERS[type];

		return (
			<Toolbar
				onTypeToggle={this.onTypeToggle}
				selectedType={selectedType}
				options={OPTIONS}
				sorters={sorters}
				selectedItems={selectedItems}
				actions={actions}
			/>
		);
	}

	onSelectionChange = (item, isSelected) => {
		const { selectedItems } = this.state;

		if(isSelected) {
			selectedItems.add(item);
		}
		else {
			selectedItems.delete(item);
		}

		this.setState({selectedItems});
	}

	render () {
		const {type, selectedItems} = this.state;

		const Cmp = type === USERS ? UserList : AdminList;

		const isSelectable = this.actionMap[type] && this.actionMap[type].length > 0;

		return (
			<div className="filterable-list">
				{this.renderToolbar()}
				<Cmp onSelectionChange={this.onSelectionChange} selectedItems={selectedItems} isSelectable={isSelectable}/>
			</div>
		);
	}
}
