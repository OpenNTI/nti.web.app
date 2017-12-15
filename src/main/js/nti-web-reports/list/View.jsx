import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Item from './Item';

export default class ReportsList extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		object: PropTypes.object
	}


	render () {
		const {object, className} = this.props;
		const {Reports: reports} = object || {};
		const hasReports = reports && !!reports.length;

		return (
			<div className={cx('reports-list-view', className)}>
				{!hasReports && this.renderEmpty()}
				{hasReports && this.renderReports(reports)}
			</div>
		);
	}


	renderEmpty () {
		return (
			<span>No Reports</span>
		);
	}


	renderReports (reports) {
		return (
			<ul>
				{reports.map((report, index) => {
					return (
						<li key={index}>
							<Item report={report} />
						</li>
					);
				})}
			</ul>
		);
	}
}
