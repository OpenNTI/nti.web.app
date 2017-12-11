import {getService} from 'nti-web-client';
import {DateTime} from 'nti-web-commons';

const COLORS = [
	'#efefef',
	'#dfdfef',
	'#9ecae1',
	'#9ecae1',
	'#6baed6',
	'#6baed6',
	'#3182bd',
	'#3182bd',
	'#08306b',
	'#08306b'
];

const ANALYTICS_LINK = 'analytics';
const ACTIVITY_BY_DATE_SUMMARY_LINK = 'activity_by_date_summary';
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const INCREMENT = 24 * 60 * 60 * 1000;

export function determineBlockColor (value, minValue = 0, maxValue, customColors) {
	const colorsToUse = customColors || COLORS;

	if ( value === 0 || maxValue === 0 ) {
		return colorsToUse[0];
	}
	const normalized = (value - minValue) / (maxValue - minValue);
	const bucket = (parseFloat(normalized.toFixed(1)) * 10);

	let index = Math.min(bucket, colorsToUse.length - 1);

	return colorsToUse[index];
}

function getInitialDailyData (rangeStart) {
	// initialize by filling out any days before the day of the week for the start time
	// (for example, if start date is a tuesday, initialize sunday and monday to 0)
	return {
		'Sunday': rangeStart.getDay() > 0 ? [{}] : [],
		'Monday': rangeStart.getDay() > 1 ? [{}] : [],
		'Tuesday': rangeStart.getDay() > 2 ? [{}] : [],
		'Wednesday': rangeStart.getDay() > 3 ? [{}] : [],
		'Thursday': rangeStart.getDay() > 4 ? [{}] : [],
		'Friday': rangeStart.getDay() > 5 ? [{}] : [],
		'Saturday': rangeStart.getDay() > 6 ? [{}] : [],
	};
}

function processData (rawData, rangeStart, rangeEnd) {
	const dates = rawData.Dates || {};
	const start = rangeStart.getTime();

	let initialData = getInitialDailyData(rangeStart);
	let max = 0;

	// iterate over every day from the start date to the end date, filling in
	// values from the raw data as we go
	for(let i = start; i <= rangeEnd; i += INCREMENT) {
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

	return {
		min: 0,
		max,
		data: initialData
	};
}

/**
 * For a given entity (or global if no entity is specified), load activity data, structured as a list of daily activity,
 * partitioned by day of the week.
 *
 * @param  {Object} entity    The entity to load daily activity (user, course, etc).  If none, get the global data via service
 * @param  {Date} startDate   (Optional) Start date.  If not specified, use the beginning of the current year (1/1/20XX)
 * @param  {Date} endDate     (Optional) End date.  If not specified, use the end of the current year (12/31/20XX)
 * @return {Promise}          Promise wrapping a data block with the daily data, plus min/max values
 */
export async function loadDailyActivity (entity, startDate, endDate) {
	const now = new Date();

	// default to beginning of current year if no startDate given
	const earliestDate = startDate || new Date('1/1/' + now.getFullYear());

	let params = ['notBefore=' + Math.floor(earliestDate.getTime() / 1000)];
	if(endDate) {
		params.push('notAfter=' + Math.floor(endDate.getTime() / 1000));
	}

	const paramStr = '?' + params.join('&');

	const service = await getService();
	let summaryData;

	try {
		if(entity) {
			const analyticsLink = entity.Links.filter(x => x.rel === ANALYTICS_LINK)[0];
			const results = await service.get(analyticsLink.href) || {};
			const activityByDateSummary = (results.Links || []).filter(x => x.rel === ACTIVITY_BY_DATE_SUMMARY_LINK)[0];
			summaryData = await service.get(activityByDateSummary.href + paramStr) || {};
		}
		else {
			// default to global if no entity specified
			const analyticsWorkspace = service.getWorkspace('Analytics');
			const activityByDateSummary = (analyticsWorkspace.Links || []).filter(x => x.rel === ACTIVITY_BY_DATE_SUMMARY_LINK)[0];
			summaryData = await service.get(activityByDateSummary.href + paramStr) || {};
		}
	}
	catch (e) {
		summaryData = null;
	}

	if(summaryData === null) {
		return null;
	}

	// default to end of current year if no endDate given
	return processData(summaryData, earliestDate, endDate || new Date('12/31/' + earliestDate.getFullYear()));
}
