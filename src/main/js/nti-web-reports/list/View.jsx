import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {Loading} from 'nti-web-commons';

import {getContext} from '../contexts';

import Group from './Group';

export default class ReportsList extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		context: PropTypes.object
	}

	state = {}

	componentDidMount () {
		this.loadReportsFor();
	}

	componentWillReceiveProps (nextProps) {
		const {context:newContext} = nextProps;
		const {context:oldContext} = this.props;

		if (newContext !== oldContext) {
			this.loadReportsFor(nextProps);
		}
	}

	loadReportsFor (props = this.props) {
		const {context} = props;

		this.setState({
			loading: true,
			hasReports: null,
			groups: null,
			error: null
		}, async () => {
			const reportContext = getContext(context);
			const hasReports = reportContext.canAccessReports();

			try {
				const groups = await reportContext.getReportGroups();

				this.setState({
					hasReports,
					groups,
					loading: false
				});
			} catch(e) {
				this.setState({
					loading: false,
					error: e
				});
			}
		});
	}


	render () {
		const {className} = this.props;
		const {loading, hasReports, error, groups} = this.state;

		return (
			<div className={cx('reports-list-view', className)}>
				{loading && this.renderLoading()}
				{!loading && error && this.renderError(error)}
				{!loading && !error && !hasReports && this.renderEmpty()}
				{!loading && !error && hasReports && this.renderReportGroups(groups)}
			</div>
		);

	}

	renderLoading () {
		return (<Loading.Mask />);
	}


	renderError () {
		return (
			<span>Error</span>
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
