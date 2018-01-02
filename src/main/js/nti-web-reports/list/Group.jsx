import React from 'react';
import PropTypes from 'prop-types';

import Item from './Item';

ReportGroup.propTypes = {
	group: PropTypes.object
};
export default function ReportGroup ({group}) {
	return (
		<div className="report-group" />
	);
}
