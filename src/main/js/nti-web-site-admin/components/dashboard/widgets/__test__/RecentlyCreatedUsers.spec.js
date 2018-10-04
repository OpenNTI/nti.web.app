import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import RecentlyCreatedUsers from '../RecentlyCreatedUsers';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (numberOfUsers) => {
	return {
		Items: [
			{
				hasLink: () => true,
				getLink: () => 'mockLink'
			}
		],
		getBatch: () => {
			let Items = [];

			for(let i = 0; i < numberOfUsers; i++) {
				const index = i + 1;

				Items.push({
					alias: 'user' + index,
					getCreatedTime: () => new Date('10/30/2018')
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
describe('Site admin dashboard widget recently created users (5 users total)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<RecentlyCreatedUsers/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin dashboard widget recently created users (3 users total)', () => {
	beforeEach(() => onBefore(3));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<RecentlyCreatedUsers/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin dashboard widget recently created users (no users)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<RecentlyCreatedUsers/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
