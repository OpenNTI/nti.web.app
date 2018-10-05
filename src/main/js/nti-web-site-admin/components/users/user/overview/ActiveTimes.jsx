import React from 'react';
import PropTypes from 'prop-types';
import {getService} from '@nti/web-client';
import {Widgets} from '@nti/web-reports';

const ANALYTICS_LINK = 'analytics';
const ACTIVE_TIMES_SUMMARY_LINK = 'active_times_summary';

const { ActiveTimesChart } = Widgets;

export default class ActiveTimes extends React.Component {
	static propTypes = {
		user: PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);

		this.state = {};
	}

	componentDidMount () {
		this.loadData();
	}

	async loadData () {
		try {
			const { user } = this.props;

			const service = await getService();
			const analyticsLink = user.getLink(ANALYTICS_LINK);
			console.log('>>> ', analyticsLink);
			const results = await service.getBatch(analyticsLink) || {};
			const activeTimesSummaryLink = results.getLink(ACTIVE_TIMES_SUMMARY_LINK);
			console.log('>>> ', activeTimesSummaryLink);
			const summaryData = await service.get(activeTimesSummaryLink) || {};

			this.setState({data: summaryData.WeekDays});
		}
		catch (e) {
			this.setState({error: e});
		}
	}

	render () {
		return (<ActiveTimesChart data={this.state.data} error={this.state.error}/>);
	}
}
