import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime} from '@nti/web-commons';

import styles from './JoinDate.css';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.JoinDate', {
	title: 'Join Date'
});

export default class JoinDate extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	static cssClassName = styles.joinDateColumn;

	static Name = () => t('title')

	static SortKey = 'createdTime';

	render () {
		const {item} = this.props;
		return (
			<div className={styles.cell}>
				<DateTime date={item.getCreatedTime()} format={DateTime.MONTH_ABBR_DAY_YEAR} />
			</div>
		);
	}
}
