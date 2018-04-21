import React from 'react';
import PropTypes from 'prop-types';
import { List } from '@nti/web-reports';

import Card from '../../../common/Card';


SiteAdminBooksReports.propTypes = {
	course: PropTypes.object
};
export default function SiteAdminBooksReports ({ course }) {
	return course ?
		(<Card><List context={course} /></Card>) :
		null;
}
