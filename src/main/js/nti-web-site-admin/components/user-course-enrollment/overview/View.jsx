import React from 'react';
import PropTypes from 'prop-types';
import {Loading} from 'nti-web-commons';
import { Widgets } from 'nti-web-reports';

import DateValue from '../../common/DateValue';

import ActiveTimes from './ActiveTimes';
import LastActivity from './LastActivity';

const { ActiveDays } = Widgets;

export default class SiteAdminUserEnrollmentView extends React.Component {
	static propTypes = {
		enrollment: PropTypes.object
	}

	render () {
		const { enrollment } = this.props;

		if(!enrollment) {
			return <Loading.Mask/>;
		}

		return (
			<div className="site-admin-user-enrollment-overview">
				<div className="date-info">
					<div className="joined">
						<DateValue date={enrollment.getCreatedTime()} label="Enrolled" />
					</div>
					<div className="last-activity">
						<LastActivity enrollment={enrollment}/>
					</div>
				</div>
				<ActiveDays entity={enrollment}/>
				<ActiveTimes enrollment={enrollment}/>
			</div>
		);

	}

}
