import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import RecentSessions from '../RecentSessions';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (numberOfUsers) => {
	return {
		Items: [
			{
				hasLink: () => true,
				getLink: () => 'mockLink'
			}
		],
		getWorkspace: () => {
			return {};
		},
		get: () => {
			let Items = [];

			const startTime = (new Date().getTime() - 1000 * 60 * 60 * 3) / 1000;

			for(let i = 0; i < numberOfUsers; i++) {
				const index = i + 1;

				Items.push({
					Username: 'user' + index,
					getCreatedTime: () => new Date('10/30/2018'),
					userAgent: i % 2 === 0 ? 'android' : 'chrome',
					SessionStartTime: startTime,
					SessionEndTime: i % 2 === 0 ? null : startTime + 60 * 5
				});
			}

			return Promise.resolve({
				Items,
				Total: Items.length
			});
		}
	};
};

const onBefore = (numberOfUsers) => {
	jest.useFakeTimers();
	setupTestClient(getMockService(numberOfUsers));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin dashboard widget recent sessions (5 sessions)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<RecentSessions/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin dashboard widget recent sessions (10 sessions)', () => {
	beforeEach(() => onBefore(10));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<RecentSessions/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin dashboard widget recent sessions (no sessions)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<RecentSessions/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
