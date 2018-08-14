import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Avatar} from  '@nti/web-commons';
import cx from 'classnames';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.InviteName', {
	headerTitle: 'Type',
	title: 'Name'
});

export default class InviteName extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired
	}

	static cssClassName = 'invite-name-col';

	static Name = () => t('title')

	// static SortKey = 'receiver'

	render () {
		const {item, store} = this.props;

		const entity = {
			Username: item.receiver,
			initials: item.receiver.charAt(0)
		};

		return (
			<div className={cx('cell', {'row-selected': store.isSelected(item)})}>
				<Avatar entity={entity}/>
				<div className="user-info">
					<div className="invite-email">{item.receiver}</div>
				</div>
			</div>
		);
	}
}