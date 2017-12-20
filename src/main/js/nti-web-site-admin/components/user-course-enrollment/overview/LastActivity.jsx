import React from 'react';
import PropTypes from 'prop-types';
import {getService} from 'nti-web-client';

import DateValue from '../../common/DateValue';

const ANALYTICS_LINK = 'analytics';

export default class LastActivity extends React.Component {
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
		const events = results.Items.filter(x => x.Title === 'Events')[0];
		const eventData = await service.get(events.href);

		this.setState({data: (eventData && eventData.Items) || []});
	}

	render () {
		const {data} = this.state;
		const firstItem = data && data[0];
		const date = (firstItem || {}).Timestamp || 0;
		const dateInSeconds = date * 1000;

		return <DateValue date={dateInSeconds} label="Last Activity"/>;
	}
}
