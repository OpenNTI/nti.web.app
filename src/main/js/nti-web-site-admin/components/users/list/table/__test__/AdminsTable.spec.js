import React from 'react';
import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import AdminsTable from '../AdminsTable';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = numberOfUsers => {
	return {
		Items: [],
		getCollection: () => {
			return {
				hasLink: () => true,
				getLink: () => 'mockLink',
			};
		},
		getBatch: () => {
			let Items = [];

			for (let i = 0; i < numberOfUsers; i++) {
				const index = i + 1;

				Items.push({
					Username: 'test' + index,
					getID: () => 'test' + index,
					getCreatedTime: () => new Date('10/30/2017'),
					getLastSeenTime: () =>
						new Date(Date.now() - 1000 * 60 * 60 * 24 * index), // last seen i days ago
				});
			}

			return Promise.resolve({
				Total: numberOfUsers,
				BatchPage: 1,
				Items,
			});
		},
		getWorkspace: () => {
			return {
				getLink: () => 'mockLink',
			};
		},
	};
};

const onBefore = numberOfUsers => {
	jest.useFakeTimers();
	setupTestClient(getMockService(numberOfUsers));
};

const onAfter = () => {
	tearDownTestClient();
};

/* eslint-env jest */
describe('Site admin user admin list (with no items)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<AdminsTable />, {
				createNodeMock: element => element,
			});
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});

describe('Site admin user admin list (with 5 items)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<AdminsTable />, {
				createNodeMock: element => element,
			});
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});

describe('Site admin user admin list (with 25 items)', () => {
	beforeEach(() => onBefore(25));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<AdminsTable />, {
				createNodeMock: element => element,
			});
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
