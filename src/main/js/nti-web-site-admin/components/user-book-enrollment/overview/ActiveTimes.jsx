import React from 'react';
import PropTypes from 'prop-types';
import {getService} from '@nti/web-client';
import { Widgets } from '@nti/web-reports';

const ANALYTICS_LINK = 'analytics';
const ACTIVE_TIMES_SUMMARY_LINK = 'active_times_summary';
const { ActiveTimesChart } = Widgets;

export default class ActiveTimes extends React.Component {
	static propTypes = {
		enrollment: PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);

		this.state = {};
	}

	componentDidMount () {
		this.loadData();
	}

	async loadData () {
		const { enrollment } = this.props;

		const service = await getService();
		const analyticsLink = enrollment.Links.filter(x => x.rel === ANALYTICS_LINK)[0];
		const results = await service.get(analyticsLink.href) || {};
		const activeTimesSummaryLink = (results.Links || []).filter(x => x.rel === ACTIVE_TIMES_SUMMARY_LINK)[0];
		const summaryData = await service.get(activeTimesSummaryLink.href) || {};

		this.setState({data: summaryData.WeekDays});
	}

	render () {
		return (<ActiveTimesChart data={this.state.data} error={this.state.error}/>);
	}
}
