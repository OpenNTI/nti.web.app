import React from 'react';
import PropTypes from 'prop-types';
import {DateTime} from 'nti-web-commons';
import {getService} from 'nti-web-client';
import {getLink} from 'nti-lib-interfaces';

const ANALYTICS = 'Analytics';
const ACTIVE_TIMES_LINK = 'active_times_summary';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];

const COLORS = [
	'#efefef',
	'#efefef',
	'#9ecae1',
	'#9ecae1',
	'#6baed6',
	'#6baed6',
	'#3182bd',
	'#3182bd',
	'#08306b',
	'#08306b'
];

function shiftForTZOffset (daysMap, offset) {
	/*
	 *  We have buckets by day (mon, tues, wed, ..., sun) and
	 *  hour (0, 1, 2, 3 ... 23) but these are in UTC
	 *  (as are all dates from the server).  We need to shift
	 *  the buckets so they show in the user's timezone.  This is
	 *  a bit tricky because shifting hours shifts them to other days.
	 *
	 *  We start by flattening in to a long list of days.  Then shift
	 *  the days based on the offset, then section back out in to days.
	 *  This works because as days shift from the front or back of the
	 *  list of hours, the wrap to the other end.
	 *
	 */
	let flattened = [];
	for (let dayIdx = 0; dayIdx < WEEKDAYS.length; dayIdx++) {
		const day = WEEKDAYS[dayIdx];
		for (let i = 0; i < 24; i++) {
			flattened.push(daysMap[day][i]);
		}
	}

	if ( offset < 0 ) {
		// Behind UTC. Take from front and move to back
		offset = Math.abs(offset);
		const left = flattened.slice(0, offset);
		const right = flattened.slice(offset, flattened.length);
		flattened = [...right, ...left];
	}
	else {
		// Ahead of UTC. Take from back and move to front
		offset = Math.abs(offset);
		const right = flattened.slice(-1 * offset);
		const left = flattened.slice(0, flattened.length - offset);
		flattened = [...left, ...right];
	}

	// Now that are flattened array has been shifted, we need to
	// reorganize by day.
	const remapped = {};
	for (let dayIdx = 0; dayIdx < WEEKDAYS.length; dayIdx++) {
		const day = WEEKDAYS[dayIdx];
		remapped[day] = flattened.splice(0, 24);
	}
	return remapped;
}

function tzOffsetHours () {
	// This isn't perfect but it should be correct enough,
	// we bucket by hours and only need to shift by
	// hours so we round if it isn't offset by a whole hour.
	const d = new Date();
	const offsetMin = d.getTimezoneOffset ? d.getTimezoneOffset() : 0;
	if (offsetMin === 0) {
		return 0;
	}

	return Math.round(offsetMin / 60) * -1;
}

function processData (daysMap) {
	// First account for the tz we are being shown in
	daysMap = shiftForTZOffset(daysMap, tzOffsetHours());

	// Next step is to pivot the data into an array of arrays.
	// First dimension is hour (by 2 hours), second dimension is
	// day. Value is count

	// As we go, look for the max, as well as the popular
	// day and time.
	let max = 0;
	let popularDay = null;
	let popularHour = null;

	// Make space
	let pivoted = Array(12).fill().map(() => Array(7).fill(0));
	for (let dayIdx = 0; dayIdx < WEEKDAYS.length; dayIdx++) {
		const day = WEEKDAYS[dayIdx];
		const hours = daysMap[day] || new Array(24).fill(0);
		for (let i = 0; i < 12; i++) {
			let count = hours[i * 2] + hours[i * 2 + 1];
			pivoted[i][dayIdx] = count;
			if ( max < count ) {
				max = count;
				popularDay = day;
				popularHour = i * 2;
			}
		}
	}
	const data = {
		cells: pivoted,
		min: 0,
		max: max,
		popular: {
			day: popularDay,
			hour: popularHour
		}
	};
	return data;
}

function determineBlockColor (value, minValue = 0, maxValue) {
	if ( value === 0 || maxValue === 0 ) {
		return COLORS[0];
	}
	const normalized = (value - minValue) / (maxValue - minValue);
	const bucket = (parseFloat(normalized.toFixed(1)) * 10);
	return COLORS[Math.min(bucket, COLORS.length - 1)];
}

function timeString (hour) {
	const d = new Date();
	d.setHours(hour);
	return DateTime.format(d, 'h a');
}

export default class ActiveTimesChart extends React.Component {
	static propTypes = {
		data: PropTypes.object,
		error: PropTypes.string
	}

	constructor (props) {
		super(props);

		// Start with no data, note this matches the data
		// shape from the server, not what we display. This
		// keeps code similar later in the process
		const empty = {};
		for (let dayIdx = 0; dayIdx < WEEKDAYS.length; dayIdx++) {
			const day = WEEKDAYS[dayIdx];
			empty[day] = Array(24).fill(0);
		}
		this.state = processData(empty);
	}

	componentWillReceiveProps (nextProps) {
		if(nextProps !== this.props) {
			this.setState(processData(nextProps.data));
		}
	}

	renderHeader () {
		return (<div className="active-times-header">Active Times</div>);
	}

	renderBlock = (block, i) => {
		const min = this.state.min;
		const max = this.state.max;
		return (
			<div key={i} className="active-block" style={{
				backgroundColor: determineBlockColor(block, min, max)
			}}/>
		);
	}

	renderRow = (row, i) => {
		return (
			<div className="active-blocks">
				{row.map(this.renderBlock)}
				<div key={i} className="time-label">{timeString(i * 2)}</div>
			</div>
		);
	}

	renderDays () {
		return (
			<div className="days-of-week">
				{SHORT_WEEKDAYS.map(function (day) {
					return <div key={day} className="day">{day}</div>;
				})}
			</div>
		);
	}

	renderChart () {
		const data = this.state.cells;
		return (
			<div className="active-times-chart">
				{data.map(this.renderRow)}
				{this.renderDays()}
			</div>
		);
	}

	renderPopular () {
		const day = this.state.popular.day;
		const hour = this.state.popular.hour;
		const showPopular = day != null && hour != null;

		return (
			<div className="active-times-popular">
				<div className="active-times-popular-header">Most Popular Time</div>
				{!showPopular && (<div className="active-times-popular-content">No Activity Found</div>)}
				{showPopular && (<div className="active-times-popular-content">{day}, {timeString(hour)} &ndash; {timeString(hour + 2)}</div>)}
			</div>
		);
	}

	render () {
		return (<div className="active-times-widget">
			{this.renderHeader()}
			{this.renderChart()}
			{this.renderPopular()}
		</div>);
	}
}
