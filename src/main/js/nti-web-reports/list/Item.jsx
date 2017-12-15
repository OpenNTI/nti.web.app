import React from 'react';
import PropTypes from 'prop-types';

import Viewer from '../viewer';

export default class ReportListItem extends React.Component {
	static propTypes = {
		report: PropTypes.object.isRequired
	}


	onClick = () => {
		const {report} = this.props;

		Viewer.show(report);
	}


	render () {
		const {report} = this.props;

		return (
			<div className="report-list-item" onClick={this.onClick}>
				{report.title}
			</div>
		);
	}
}
