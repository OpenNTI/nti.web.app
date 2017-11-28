import React from 'react';
import PropTypes from 'prop-types';
import {getService} from 'nti-web-client';
import {DateTime, Loading, Flyout} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';
import cx from 'classnames';

import {determineBlockColor} from '../../../common/utils';

const ANALYTICS_LINK = 'analytics';

const ACTIVITY_BY_DATE_SUMMARY_LINK = 'activity_by_date_summary';

const LABELS = {
	title: 'Daily Activity'
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
const SHORT_MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const INCREMENT = 24 * 60 * 60 * 1000;

const t = scoped('nti-web-site-admins.components.users.user.overview.recentsessions', LABELS);

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
			<div className={className} data-month={day.firstOfFullWeek}>
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

		let infoStr = DateTime.format(day.date, 'LL') + ' - ' + day.value + ' event';

		if(day.value !== 1) {
			infoStr += 's';
		}

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
		user: PropTypes.object.isRequired
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

	processData (rawData) {
		const dates = rawData.Dates || {};
		const rawStartDate = new Date(rawData.StartTime);

		// start at the beginning of the year
		const startDate = new Date('1/1/' + rawStartDate.getFullYear());
		const start = startDate.getTime();

		// go to the end of the year
		const endDate = new Date('12/31/' + rawStartDate.getFullYear()).getTime();

		// initialize by filling out any days before the day of the week for the start time
		// (for example, if start date is a tuesday, initialize sunday and monday to 0)
		let initialData = {
			'Sunday': startDate.getDay() > 0 ? [{}] : [],
			'Monday': startDate.getDay() > 1 ? [{}] : [],
			'Tuesday': startDate.getDay() > 2 ? [{}] : [],
			'Wednesday': startDate.getDay() > 3 ? [{}] : [],
			'Thursday': startDate.getDay() > 4 ? [{}] : [],
			'Friday': startDate.getDay() > 5 ? [{}] : [],
			'Saturday': startDate.getDay() > 6 ? [{}] : [],
		};

		let max = 0;

		// iterate over every day from the start date to the end date, filling in
		// values from the raw data as we go
		for(let i = start; i <= endDate; i += INCREMENT) {
			const curr = new Date(i);
			const dateStr = DateTime.format(curr, 'YYYY-MM-DD');
			const day = WEEKDAYS[curr.getDay()];
			const value = dates[dateStr];

			if(value && value > max) {
				max = value;
			}

			const block = {
				value: value || 0,
				date: curr
			};

			const dayArray = initialData[day];

			const currLatestForDay = dayArray[dayArray.length - 1] || {};

			if(currLatestForDay && !currLatestForDay.date || currLatestForDay.date.getMonth() !== curr.getMonth()) {
				block.firstDayTypeOfMonth = true;

				if(curr.getDay() === 0) {
					block.firstOfFullWeek = SHORT_MONTHS[curr.getMonth()];
				}
			}

			if(curr.getDate() === 1 && curr.getDay() !== 0) {
				block.firstOfMonth = true;
			}

			if(curr.getMonth() % 2 === 1) {
				block.oddMonth = true;
			}

			initialData[day].push(block);
		}

		let numCols;

		// fill out last week of year
		for(let i = 0; i < WEEKDAYS.length; i++) {
			const day = WEEKDAYS[i];

			if(numCols && initialData[day].length < numCols) {
				initialData[day].push({});
			}

			numCols = initialData[day].length;
		}

		this.setState({
			min: 0,
			max,
			loading: false,
			data: initialData
		});
	}

	async loadData () {
		const { user } = this.props;

		const now = new Date();
		const earliestDate = new Date('1/1/' + now.getFullYear());
		const params = '?notBefore=' + Math.floor(earliestDate.getTime() / 1000);

		const service = await getService();
		const analyticsLink = user.Links.filter(x => x.rel === ANALYTICS_LINK)[0];
		const results = await service.get(analyticsLink.href) || {};
		const activityByDateSummary = (results.Links || []).filter(x => x.rel === ACTIVITY_BY_DATE_SUMMARY_LINK)[0];
		const summaryData = await service.get(activityByDateSummary.href + params) || {};

		this.processData(summaryData || {});
	}

	renderDay = (day) => {
		const { min, max } = this.state;

		return (<Day day={day} min={min} max={max}/>);
	}

	renderDayRow = (weekday, i) => {
		const { data } = this.state;

		return (
			<div className="activity-day-row">
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
			<div className="user-active-days">
				{this.renderHeader()}
				{this.renderContent()}
			</div>
		);
	}
}
