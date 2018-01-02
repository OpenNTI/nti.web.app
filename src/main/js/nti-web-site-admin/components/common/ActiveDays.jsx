import React from 'react';
import PropTypes from 'prop-types';
import {DateTime, Loading, Flyout} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';
import cx from 'classnames';

import {determineBlockColor, loadDailyActivity} from './utils';

const LABELS = {
	title: 'Daily Activity',
	noData: 'No activity found'
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];

const t = scoped('nti-web-site-admins.components.common.activedays', LABELS);

function makeMonthLabel (day) {
	// if we want to show the last two digits of the year for each Jan label
	// then use the logic below (so the chart might look like Nov   Dec    Jan '18    Feb   etc...)
	//
	// if(day.firstOfFullWeek === 'jan') {
	// 	return 'jan \'' + day.date.getFullYear().toString().substr(2,2);
	// }

	return day.firstOfFullWeek;
}

class Day extends React.Component {
	static propTypes = {
		day: PropTypes.object.isRequired,
		min: PropTypes.number.isRequired,
		max: PropTypes.number.isRequired
	}

	attachFlyoutRef = x => this.flyout = x

	renderBlock () {
		const { day, min, max } = this.props;

		if(!day.date) {
			return <div className="activity-day no-data"/>;
		}

		const className = cx('activity-day-wrapper', day.firstOfFullWeek, {
			'odd-month' : day.oddMonth,
			'first-of-week' : day.firstOfFullWeek
		});

		return (
			<div className={className} data-month={makeMonthLabel(day)}>
				<div className="activity-day" style={{
					backgroundColor: determineBlockColor(day.value, min, max)
				}}/>
			</div>
		);
	}

	render () {
		const { day } = this.props;

		if(!day.date) {
			return (this.renderBlock());
		}

		let infoStr = DateTime.format(day.date, 'LL');

		return (<Flyout.Triggered
			className="activity-day-trigger"
			trigger={this.renderBlock()}
			ref={this.attachFlyoutRef}
			hover
		>
			<div>
				<div className="activity-day-info">{infoStr}</div>
			</div>
		</Flyout.Triggered>);
	}
}

export default class ActiveDays extends React.Component {
	static propTypes = {
		entity: PropTypes.object,
		startDate: PropTypes.object,
		endDate: PropTypes.object
	}

	constructor (props) {
		super(props);

		this.state = {
			loading: true
		};
	}

	componentDidMount () {
		this.loadData();
	}

	async loadData () {
		const { entity, startDate, endDate } = this.props;

		const data = await loadDailyActivity(entity, startDate, endDate);

		if(!data) {
			this.setState({
				loading: false,
				data: null
			});

			return;
		}

		this.setState({
			...data,
			loading: false
		});
	}

	renderDay = (day, i) => {
		const { min, max } = this.state;

		return (<Day key={day.date || i} day={day} min={min} max={max}/>);
	}

	renderDayRow = (weekday, i) => {
		const { data } = this.state;

		return (
			<div key={SHORT_WEEKDAYS[i]} className="activity-day-row">
				<div className="weekday">
					{i % 2 === 1 ? SHORT_WEEKDAYS[i] : ''}
				</div>
				{data[weekday].map(this.renderDay)}
			</div>
		);
	}

	renderHeader () {
		return <div className="daily-activity-header">{t('title')}</div>;
	}

	renderContent () {
		const { data, loading } = this.state;

		if(loading) {
			return <Loading.Mask/>;
		}
		else if(!data) {
			return <div className="no-data">{t('noData')}</div>;
		}

		if(data) {
			return (
				<div className="daily-activity-body">
					{WEEKDAYS.map(this.renderDayRow)}
				</div>
			);
		}
	}

	render () {
		return (
			<div className="site-admin-active-days">
				{this.renderHeader()}
				{this.renderContent()}
			</div>
		);
	}
}
