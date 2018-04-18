import React from 'react';
import PropTypes from 'prop-types';
import {Progress} from '@nti/web-course';

import Card from '../../common/Card';

SiteAdminUserEnrollmentProgress.propTypes = {
	course: PropTypes.object,
	enrollment: PropTypes.object
};
export default function SiteAdminUserEnrollmentProgress ({course, enrollment}) {
	return (
		<Card>
			{course && enrollment && (
				<Progress.Overview course={course} enrollment={enrollment} singleItem />
			)}
		</Card>
	);
}
