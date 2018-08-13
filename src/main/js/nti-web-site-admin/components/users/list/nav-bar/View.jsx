import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';

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
	items: 'items'
})
class UsersTable extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		items: PropTypes.array,
		loading: PropTypes.bool
	}

	componentDidMount () {
		this.props.store.loadInvitations();
	}

	componentWillUnmount () {
		this.props.store.setUnload();
	}

	render () {
		const {loading, items} = this.props;

		const hasCount = !loading && items != null;

		return (
			<Card className="site-admin-user-list-nav-bar">
				<div className="header">{t('people')}</div>
				<Tabs>
					<LinkTo.Path to="./" activeClassName="active" exact>{t('learners')}</LinkTo.Path>
					<LinkTo.Path to="./admins" activeClassName="active">{t('admins')}</LinkTo.Path>
					<LinkTo.Path to="./invitations" activeClassName="active">
						{t('invitations')}
						{hasCount && <div className="invitations-count">{items.length}</div>}
					</LinkTo.Path>
				</Tabs>
				<div className="invite" onClick={() => {
					InvitePeople.show();
				}}>
					{t('invitePeople')}
				</div>
			</Card>
		);
	}
}
