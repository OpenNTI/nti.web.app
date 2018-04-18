import React from 'react';
import {getService} from '@nti/web-client';
import {getLink} from '@nti/lib-interfaces';
import { Widgets } from '@nti/web-reports';

const { ActiveTimesChart } = Widgets;

const ANALYTICS = 'Analytics';
const ACTIVE_TIMES_LINK = 'active_times_summary';

export default class ActiveTimes extends React.Component {
	constructor (props) {
		super(props);

		this.state = {};
	}

	componentDidMount () {
		this.loadData();
	}

	async loadData () {
		try{
			const service = await getService();
			const sessionsCollection = service.getWorkspace(ANALYTICS);
			const link = getLink(sessionsCollection, ACTIVE_TIMES_LINK);
			const stats = await service.get(link);
			this.setState({ data: stats['WeekDays'] });
		}
		catch (e) {
			this.setState({error: e});
		}
	}

	render () {
		return (<ActiveTimesChart data={this.state.data} error={this.state.error}/>);
	}
}
