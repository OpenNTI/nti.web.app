import React from 'react';
import PropTypes from 'prop-types';

import Item from './Item';

ReportGroup.propTypes = {
	group: PropTypes.object
};
export default function ReportGroup ({group}) {
	const {name, description, reports} = group;

	//if we don't have any reports don't show the group
	if (!reports || !reports.length) { return null; }

	return (
		<div className="report-group">
			{name && (<div className="name">{name}</div>)}
			{description && (<div className="description">{description}</div>)}
			<ul className="reports">
				{
					reports.map((report, index) => {
						return (
							<li key={index}>
								<Item report={report} />
							</li>
						);
					})
				}
			</ul>
		</div>
	);
}
