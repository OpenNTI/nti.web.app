import './View.scss';
import React from 'react';
import PropTypes from 'prop-types';
import { scoped } from '@nti/lib-locale';
import { DateTime } from '@nti/web-commons';

import DateValue from '../../common/DateValue';

const t = scoped(
	'nti-web-site-admin.components.user-book-enrollment.Overview',
	{
		lastSeen: 'Last Active',
	}
);

export default class SiteAdminUserBookView extends React.Component {
	static propTypes = {
		userBookRecord: PropTypes.object,
	};

	render() {
		const { userBookRecord } = this.props;

		return (
			<div className="site-admin-user-enrollment-overview">
				{userBookRecord && (
					<DateValue
						date={this.props.userBookRecord.getLastSeenTime()}
						format={DateTime.MONTH_NAME_DAY_YEAR_TIME}
						label={t('lastSeen')}
					/>
				)}
			</div>
		);
	}
}
