import React from 'react';
import PropTypes from 'prop-types';

export default class ReportCourseInstanceAssignmentItem extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		onSelect: PropTypes.func
	}


	onClick = () => {
		const {item, onSelect} = this.props;

		if (onSelect) {
			onSelect(item);
		}
	}


	render () {
		const {item} = this.props;

		return (
			<div className="report-course-instance-assignment-item" onClick={this.onClick}>
				{item.title}
			</div>
		);
	}
}
