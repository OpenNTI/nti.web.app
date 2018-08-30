import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime} from '@nti/web-commons';
import cx from 'classnames';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.LastSeen', {
	never: 'Never',
	duration: '%(duration)s ago',
	title: 'Last Active',
	now: 'Now'
});


export default class LastSeen extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	static cssClassName = 'lastseen-col';

	static Name = () => t('title')

	static SortKey = 'lastSeenTime'

	render () {
		const {item} = this.props;

		const lastSeenTime = item.getLastSeenTime && item.getLastSeenTime();
		let label = t('never');

		if(lastSeenTime && lastSeenTime > 0) {
			const diff = Date.now() - lastSeenTime;

			if(diff <= (60 * 1000)) {
				label = t('now');
			}
			else {
				label = t('duration', { duration: DateTime.getNaturalDuration(Date.now() - lastSeenTime, 1)});
			}
		}

		return <div className={cx('cell')}>{label}</div>;
	}
}
