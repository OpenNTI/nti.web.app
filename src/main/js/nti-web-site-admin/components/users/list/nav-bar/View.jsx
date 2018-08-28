import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';
import {Prompt} from '@nti/web-commons';

import Card from '../../../common/Card';
import Tabs from '../../../common/Tabs';
import InvitePeople from '../InvitePeople';
import Store from '../table/InvitationsStore';

const DEFAULT_TEXT = {
	learners: 'Learners',
	admins: 'Admins',
	invitations: 'Invitations',
	invitePeople: 'Invite People',
	people: 'People'
};

const t = scoped('nti-site-admin.users.list.navbar.View', DEFAULT_TEXT);

export default
@Store.connect({
	loading: 'loading',
	total: 'total',
	showInviteDialog: 'showInviteDialog'
})
class UserListNavBar extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		total: PropTypes.number,
		loading: PropTypes.bool,
		showInviteDialog: PropTypes.bool
	}

	state = {}

	componentDidMount () {
		this.props.store.canSendInvitations().then(canSendInvitations => {
			this.setState({canSendInvitations});
		});
	}

	componentWillUnmount () {
		this.props.store.setUnload();
	}

	render () {
		const {loading, total, showInviteDialog, store} = this.props;
		const {canSendInvitations} = this.state;

		const hasCount = !loading && (total || total === 0);

		return (
			<Card className="site-admin-user-list-nav-bar">
				<div className="header">{t('people')}</div>
				<Tabs>
					<LinkTo.Path to="./" activeClassName="active" exact>{t('learners')}</LinkTo.Path>
					<LinkTo.Path to="./admins" activeClassName="active">{t('admins')}</LinkTo.Path>
					<LinkTo.Path to="./invitations" activeClassName="active">
						{t('invitations')}
						{hasCount && <div className="invitations-count">{total || 0}</div>}
					</LinkTo.Path>
				</Tabs>
				{canSendInvitations && (
					<div className="invite" onClick={() => {
						store.showInviteDialog();
					}}>
						<i className="icon-addfriend"/>{t('invitePeople')}
					</div>
				)}
				{showInviteDialog && (
					<Prompt.Dialog onBeforeDismiss={this.hideChangeRolesDialog}>
						<InvitePeople store={store} loading={loading}/>
					</Prompt.Dialog>
				)}
			</Card>
		);
	}
}
