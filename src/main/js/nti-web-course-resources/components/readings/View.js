import React from 'react';

import List from './List';

Readings.propTypes = {
	course: React.PropTypes.object,
	activeResource: React.PropTypes.string,
	gotoResource: React.PropTypes.func
};
export default function Readings ({course, activeResource, gotoResource}) {
	return (
		<div className="course-resources-readings">
			{activeResource ?
				(<List course={course} gotoResource={gotoResource} />) :
				(<span>TODO: implement this</span>)
			}
		</div>
	);
}
