import React from 'react';

import Controls from './Controls';
import Readings, {KEY as READINGS} from './Readings';

export default class CourseResources extends React.Component {
	static READINGS = READINGS

	static propTypes = {
		course: React.PropTypes.object,
		createResource: React.PropTypes.func,
		gotoResource: React.PropTypes.func
	}

	static defaultProps = {
		activeType: READINGS
	}


	onCreate = () => {
		const {createResource} = this.props;

		if (createResource) {
			createResource();
		}
	}


	gotoResource = (id) => {
		const {gotoResource} = this.props;

		if (gotoResource) {
			gotoResource(id);
		}
	}


	render () {
		const {course} = this.props;

		return (
			<div className="course-resources">
				<Controls onCreate={this.onCreate} />
				<Readings course={course} gotoResource={this.gotoResource} />
			</div>
		);
	}
}
