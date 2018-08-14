import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime} from '@nti/web-commons';
import cx from 'classnames';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.InviteDate', {
	headerTitle: 'Invite Date',
	title: 'Invite Date',
	today: 'Today',
	yesterday: 'Yesterday'
});

export default class InviteDate extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired
	}

	static cssClassName = 'invitedate-col';

	static Name = () => t('title')

	// static SortKey = 'CreatedTime';

	render () {
		const {item, store} = this.props;

		const isToday = DateTime.isToday(item.getCreatedTime());

		let newDate = new Date(item.getCreatedTime());
		newDate.setDate(newDate.getDate() + 1);
		const isYesterday = DateTime.isToday(newDate);

		return (
			<div className={cx('cell', {'row-selected': store.isSelected(item)})}>
				{!isToday && !isYesterday && <DateTime className="value" date={item.getCreatedTime()} format="LL" />}
				{isToday && <span>{t('today')}</span>}
				{isYesterday && <span>{t('yesterday')}</span>}
			</div>
		);
	}
}
