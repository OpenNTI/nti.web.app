import './View.scss';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { scoped } from '@nti/lib-locale';
import { LinkTo } from '@nti/web-routing';
import { Prompt } from '@nti/web-commons';

import Card from '../../../common/Card';
import Tabs from '../../../common/Tabs';
import { canSendInvitations } from '../invitations/Store';
import { InvitePeopleForm } from '../invitations/InvitePeople';
import { InviteCount } from '../invitations/InviteCount';

import SeatLimit from './SeatLimit';

const DEFAULT_TEXT = {
	learners: 'Users',
	admins: 'Site Admins',
	deactivated: 'Deactivated',
	invitations: 'Invitations',
	invitePeople: 'Invite People',
	courseAdmins: 'Course Admins',
	people: 'People',
};

const t = scoped('nti-site-admin.users.list.navbar.View', DEFAULT_TEXT);

export default class UserListNavBar extends React.Component {
	static propTypes = {
		total: PropTypes.number,
		loading: PropTypes.bool,
		showInviteDialog: PropTypes.bool,
	};

	state = {};

	componentDidMount() {
		canSendInvitations().then(canSendInvitations => {
			this.setState({ canSendInvitations });
		});
	}

	showInviteDialog() {
		this.setState({ showInvite: true });
	}
	hideInviteDialog() {
		this.setState({ showInvite: false });
	}

	render() {
		const { className } = this.props;
		const { canSendInvitations, showInvite } = this.state;

		return (
			<div className={cx('site-admin-user-list-nav-bar', className)}>
				<Card>
					<SeatLimit />
					<Tabs>
						<LinkTo.Path to="./" activeClassName="active" exact>
							{t('learners')}
						</LinkTo.Path>
						<LinkTo.Path to="./admins" activeClassName="active">
							{t('admins')}
						</LinkTo.Path>
						<LinkTo.Path
							to="./course-admins"
							activeClassName="active"
						>
							{t('courseAdmins')}
						</LinkTo.Path>
						<LinkTo.Path
							to="./deactivated"
							activeClassName="active"
						>
							{t('deactivated')}
						</LinkTo.Path>
					</Tabs>
				</Card>
				<Card>
					{canSendInvitations && (
						<div
							className="invite"
							onClick={() => {
								this.showInviteDialog();
							}}
						>
							<i className="icon-addfriend" />
							{t('invitePeople')}
						</div>
					)}
					<Tabs>
						<LinkTo.Path
							to="./invitations"
							activeClassName="active"
						>
							{t('invitations')}
							<InviteCount className="invitations-count" />
						</LinkTo.Path>
					</Tabs>
				</Card>
				{showInvite && (
					<Prompt.Dialog
						onBeforeDismiss={() => this.hideInviteDialog()}
					>
						<InvitePeopleForm
							onDone={() => this.hideInviteDialog()}
						/>
					</Prompt.Dialog>
				)}
			</div>
		);
	}
}
