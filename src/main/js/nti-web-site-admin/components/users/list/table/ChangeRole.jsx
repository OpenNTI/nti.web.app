import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DialogButtons, Avatar, Panels} from '@nti/web-commons';
import {Connectors} from '@nti/lib-store';

const ADMIN = 'admin';
const LEARNER = 'learner';

const DEFAULT_TEXT = {
	description: 'Changing a person\'s role will effect what features and permissions are available.',
	subDescription: 'You can change a person\'s role at any time.',
	people: 'People',
	title: {
		one: 'Change Roles (%(count)s Person)',
		other: 'Change Roles (%(count)s People)'
	},
	roles: 'Roles',
	administrator: 'Administrator',
	learner: 'Learner'
};

const t = scoped('nti-web-site-admin.componentsusers.list.table.ChangeRole', DEFAULT_TEXT);


export default
@Connectors.Any.connect({
	addAdmin: 'addAdmin',
	removeAdmin: 'removeAdmin'
})
class ChangeRole extends React.Component {
	static propTypes = {
		addAdmin: PropTypes.func.isRequired,
		removeAdmin: PropTypes.func.isRequired,
		selectedUsers: PropTypes.array,
		removing: PropTypes.bool,
		onDismiss: PropTypes.func

	}

	constructor (props) {
		super(props);

		this.state = {
			selectedType: props.removing ? ADMIN : LEARNER
		};
	}


	state = {}

	onSave = () => {
		const {onDismiss, selectedUsers, addAdmin, removeAdmin} = this.props;
		const {selectedType} = this.state;

		if(selectedType === ADMIN) {
			addAdmin(selectedUsers);
		}
		else {
			removeAdmin(selectedUsers);
		}

		onDismiss();
	}

	renderUser = (user) => {
		return <div key={user.getID()} className="user"><Avatar entity={user}/></div>;
	}

	renderOption (type) {
		const isSelected = this.state.selectedType === type;

		return (
			<div className="role-option" onClick={() => { this.setState({selectedType: type}); }}>
				{isSelected ? <div className="radio selected"><div className="inner"/></div> : <div className="radio"/>}
				<div className="label">{type === ADMIN ? t('administrator') : t('learner')}</div>
			</div>
		);
	}

	render () {
		const {selectedUsers} = this.props;

		const buttons = [
			{
				label: 'Cancel',
				className: 'cancel',
				onClick: this.props.onDismiss
			},
			{
				label: 'Save',
				className: 'save',
				onClick: this.onSave
			}
		];


		return (
			<div className="site-admin-change-role-dialog">
				<div className="title">
					<Panels.TitleBar title={t('title', { count: (selectedUsers || []).length })} iconAction={this.props.onDismiss} />
				</div>
				<div className="contents">
					<div className="description-container">
						<div className="description">{t('description')}</div>
						<div className="description">{t('subDescription')}</div>
					</div>
					<div className="people">
						<div className="subtitle">{t('people')}</div>
						<div className="people-list">
							{(selectedUsers || []).map(this.renderUser)}
						</div>
					</div>
					<div className="roles">
						<div className="title">{t('roles')}</div>
						<div className="role-options">
							{this.renderOption(ADMIN)}
							{this.renderOption(LEARNER)}
						</div>
					</div>
				</div>
				<DialogButtons buttons={buttons}/>
			</div>
		);
	}
}
