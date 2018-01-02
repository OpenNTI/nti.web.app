import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import {getContext} from '../contexts';

import Group from './Group';

export default class ReportsList extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		object: PropTypes.object
	}


	render () {
		const {object, className} = this.props;
		const context = getContext(object);
		const hasReports = context.canAccessReports();
		const groups = context.getReportGroups();

		return (
			<div className={cx('reports-list-view', className)}>
				{!hasReports && this.renderEmpty()}
				{hasReports && this.renderReportGroups(groups)}
			</div>
		);
	}


	renderEmpty () {
		return (
			<span>No Reports</span>
		);
	}


	renderReportGroups (groups) {
		return (
			<ul className="groups">
				{groups.map((group, index) => {
					return (
						<li key={index}>
							<Group group={group} />
						</li>
					);
				})}
			</ul>
		);
	}
}
