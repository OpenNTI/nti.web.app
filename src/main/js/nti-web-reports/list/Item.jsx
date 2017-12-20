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
				<div className="meta">
					<div className="labels">
						<div className="title">
							{report.title}
						</div>
						<div className="supports">
							{report.supported_types.map((type, index) => {
								return (
									<span key={index} className="type">
										{type}
									</span>
								);
							})}
						</div>
					</div>
					<div className="description">
						{report.description}
					</div>
				</div>
				<div className="actions">
					<i className="icon-shareto" />
				</div>
			</div>
		);
	}
}
