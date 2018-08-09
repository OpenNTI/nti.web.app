import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime} from '@nti/web-commons';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.InviteDate', {
	headerTitle: 'Invite Date'
});

export default class InviteDate extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		nonViewable: PropTypes.bool
	}

	static cssClassName = 'invitedate-col';

	static Name = 'Invite Date'

	// static SortKey = 'CreatedTime';

	render () {
		// const {item} = this.props;
		return <div></div>;
	}
}
