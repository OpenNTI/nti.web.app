import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import ActiveTimes from '../ActiveTimes';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (hasData) => {
	return {
		get: () => {
			if(hasData) {
				return {
					WeekDays: {
						Friday: [0, 0, 4, 7, 4, 2, 8, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						Monday: [3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 0, 0, 0, 15, 5, 2, 1, 0, 0],
						Saturday: [4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						Sunday: [10, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						Thursday: [9, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 0, 2, 1, 0, 0, 6, 0, 0],
						Tuesday: [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						Wednesday: [5, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 3, 0, 0, 2, 0, 0, 0, 0, 0]
					}
				};
			}

			return {};
		},
		getBatch: () => {
			return {
				getLink: () => 'mockActiveTimes'
			};
		}
	};
};

const onBefore = (hasData) => {
	jest.useFakeTimers();
	setupTestClient(getMockService(hasData));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin user course enrollment overview active times widget (has data)', () => {
	beforeEach(() => onBefore(true));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const enrollment = {
			getLink: () => 'mockAnalytics'
		};

		const cmp = renderer.create(<ActiveTimes enrollment={enrollment}/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin user course enrollment overview active times widget (has no data)', () => {
	beforeEach(() => onBefore(false));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const enrollment = {
			getLink: () => 'mockAnalytics'
		};

		const cmp = renderer.create(<ActiveTimes enrollment={enrollment}/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
