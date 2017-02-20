import React from 'react';

import List from './List';

Readings.propTypes = {
	course: React.PropTypes.object,
	gotoResource: React.PropTypes.func
};
export default function Readings ({course, gotoResource}) {
	return (
		<div className="course-resources-readings">
			<List course={course} gotoResource={gotoResource} />
		</div>
	);
}
