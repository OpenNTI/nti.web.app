import React from 'react';
import renderer from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { Date as DateUtils } from '@nti/lib-commons';

import ActiveTimes from '../ActiveTimes';
import { mockActiveTimeData } from '../../../dashboard/widgets/__test__/active-time-data';

const { tearDownTestClient, setupTestClient } = TestUtils;
const { MockDate } = DateUtils;

const getMockService = hasData => {
	return {
		get: () => {
			if (hasData) {
				return mockActiveTimeData;
			}

			return {};
		},
		getBatch: () => {
			return {
				getLink: () => 'mockActiveTimes',
			};
		},
	};
};

const onBefore = hasData => {
	jest.useFakeTimers();
	setupTestClient(getMockService(hasData));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin user course enrollment overview active times widget (has data)', () => {
	const actingDate = new Date('10/31/2018');
	MockDate.install(actingDate);

	beforeEach(() => onBefore(true));
	afterEach(onAfter);
	afterAll(() => {
		MockDate.uninstall();
	});

	test('Basic render test', async () => {
		const enrollment = {
			getLink: () => 'mockAnalytics',
		};

		const cmp = renderer.create(<ActiveTimes enrollment={enrollment} />);

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
			getLink: () => 'mockAnalytics',
		};

		const cmp = renderer.create(<ActiveTimes enrollment={enrollment} />);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
