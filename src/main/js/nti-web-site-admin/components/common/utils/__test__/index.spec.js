import {loadDailyActivity} from '../';

const mockService = () => ({
	getWorkspace: (o) => {
		return {
			Links: [{ rel: 'activity_by_date_summary', href: 'getActivity'}]
		};
	},
	get: (href) => {
		if(href.indexOf('getActivity') === 0) {
			return Promise.resolve({
				Dates: {
					'2017-07-05': 12,
					'2017-07-06': 1,
					'2017-07-07': 7,
					'2017-07-08': 2,
					'2017-07-09': 0,
					'2017-07-10': 18
				}
			});
		}

		if(href.indexOf('getAnalytics') === 0) {
			return Promise.resolve({
				Links: [{ rel: 'activity_by_date_summary', href: 'getActivity'}]
			});
		}
	}
});

const onBefore = () => {
	global.$AppConfig = {
		...(global.$AppConfig || {}),
		nodeService: mockService(),
		nodeInterface: {
			getServiceDocument: () => Promise.resolve(global.$AppConfig.nodeService)
		}
	};
};

const onAfter = () => {
	//unmock getService()
	const {$AppConfig} = global;
	delete $AppConfig.nodeInterface;
	delete $AppConfig.nodeService;
};

// 7/3/2017
function getDateStr (date) {
	if(!date) {
		return '--';
	}
	return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
}

/* eslint-env jest */
describe('loadDailyActivity test', () => {
	beforeEach(onBefore);
	afterEach(onAfter);

	const getValueForDate = (results, dayOfWeek, dateStr) => {
		return results.data[dayOfWeek].filter(x => getDateStr(x.date) === dateStr)[0];
	};

	const findDateInAnyList = (results, dateStr) => {
		let match;

		Object.keys(results.data).forEach(d => {
			const possibleMatch = results.data[d].filter(x => getDateStr(x.date) === dateStr)[0];

			if(possibleMatch) {
				match = possibleMatch;
			}
		});

		return match;
	};

	const verifyDate = (results, dateStr, dayOfWeek, value, firstOfFullWeek, firstOfMonth, firstDayTypeOfMonth) => {
		const dateObj = getValueForDate(results, dayOfWeek, dateStr);

		expect(dateObj.value).toEqual(value);
		expect(dateObj.firstOfFullWeek).toEqual(firstOfFullWeek);
		expect(dateObj.firstOfMonth).toEqual(firstOfMonth);
		expect(dateObj.firstDayTypeOfMonth).toEqual(firstDayTypeOfMonth);
	};

	const verifyDateExistence = (results, dateStr, dayOfWeek, exists) => {
		const dateObj = getValueForDate(results, dayOfWeek, dateStr);

		if(exists) {
			expect(dateObj).toBeDefined();
		}
		else {
			expect(dateObj).not.toBeDefined();
		}
	};

	const verifyJulyData = (results) => {
		// Sunday July 2 is the start of the first full week of July and has no value
		verifyDate(results, '7/2/2017', 'Sunday', 0, 'jul', undefined, true);

		// Monday July 3 is the first Monday of July and has no value
		verifyDate(results, '7/3/2017', 'Monday', 0, undefined, undefined, true);

		// Monday July 10 is NOT the first Monday of July and has a value of 18
		verifyDate(results, '7/10/2017', 'Monday', 18, undefined, undefined, undefined);

		// Tuesday July 4 is the first Tuesday of July and has no value
		verifyDate(results, '7/4/2017', 'Tuesday', 0, undefined, undefined, true);

		// Wednesday July 5 is the first Wednesday of July and has a value of 12
		verifyDate(results, '7/5/2017', 'Wednesday', 12, undefined, undefined, true);

		// Thursday July 6 is the first Thursday of July and has a value of 1
		verifyDate(results, '7/6/2017', 'Thursday', 1, undefined, undefined, true);

		// Friday July 7 is the first Friday of July and has a value of 7
		verifyDate(results, '7/7/2017', 'Friday', 7, undefined, undefined, true);

		// Saturday July 1 is the first day of July, the first Saturday of July and has no value
		verifyDate(results, '7/1/2017', 'Saturday', 0, undefined, true, true);

		// Saturday July 8 is NOT the first Saturday of July and has a value of 2
		verifyDate(results, '7/8/2017', 'Saturday', 2, undefined, undefined, undefined);
	};

	test('Test global data with date range', () => {
		return loadDailyActivity(null, new Date('07/01/2017'), new Date('07/15/2017'))
			.then(results => {
				verifyJulyData(results);

				// date range should return only date data within that range, so there should be no first/end of year
				verifyDateExistence(results, '1/1/2017', 'Sunday', false);
				verifyDateExistence(results, '12/31/2017', 'Sunday', false);
			});
	});

	test('Test entity data with date range', () => {
		const entity = {
			Links: [{ rel: 'analytics', href: 'getAnalytics'}]
		};

		return loadDailyActivity(entity, new Date('07/01/2017'), new Date('07/15/2017'))
			.then(results => {
				// same data as the global case
				verifyJulyData(results);
			});
	});

	test('Test global data with no date range', () => {
		return loadDailyActivity()
			.then(results => {
				const now = new Date();

				const oneYearAgo = (now.getMonth() + 1) + '/' + now.getDate() + '/' + (now.getFullYear() - 1);

				// should stretch back a year from now
				expect(findDateInAnyList(results, oneYearAgo)).toBeDefined();
			});
	});
});
