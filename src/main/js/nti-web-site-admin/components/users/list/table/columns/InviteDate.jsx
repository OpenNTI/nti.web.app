import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { scoped } from '@nti/lib-locale';
import { DateTime } from '@nti/web-commons';

import styles from './InviteDate.css';

const t = scoped(
	'nti-web-site-admin.components.users.list.table.columns.InviteDate',
	{
		headerTitle: 'Invite Date',
		title: 'Invite Date',
		today: 'Today',
		yesterday: 'Yesterday',
	}
);

const Format = DateTime.MONTH_ABBR_DAY_YEAR;

export default class InviteDate extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
	};

	static cssClassName = 'invite-date-column';

	static Name = () => t('title');

	static SortKey = 'created_time';

	render() {
		const { item } = this.props;

		const isToday = DateTime.isToday(item.getCreatedTime());

		let newDate = new Date(item.getCreatedTime());
		newDate.setDate(newDate.getDate() + 1);
		const isYesterday = DateTime.isToday(newDate);

		return (
			<div className={cx('cell', styles.cell)}>
				{!isToday && !isYesterday && (
					<DateTime
						className={styles.value}
						date={item.getCreatedTime()}
						format={Format}
					/>
				)}
				{isToday && <span>{t('today')}</span>}
				{isYesterday && <span>{t('yesterday')}</span>}
			</div>
		);
	}
}
