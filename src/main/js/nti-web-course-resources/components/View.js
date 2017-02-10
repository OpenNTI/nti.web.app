import React from 'react';

import Controls from './Controls';
import Readings, {KEY as READINGS} from './Readings';

const TYPE_TO_CMP = {
	[READINGS]: Readings
};

export default class CourseResources extends React.Component {
	static READINGS = READINGS

	static propTypes = {
		course: React.PropTypes.object,
		activeType: React.PropTypes.string,
		activeResource: React.PropTypes.string,
		createResource: React.PropTypes.func,
		gotoResource: React.PropTypes.func
	}

	static defaultProps = {
		activeType: READINGS
	}


	render () {
		const {course, activeType, activeResource} = this.props;

		return (
			<div className="course-resources">
				<Controls onCreate={this.onCreate} onSearch={this.onSearch} />
			</div>
		);
	}
}
