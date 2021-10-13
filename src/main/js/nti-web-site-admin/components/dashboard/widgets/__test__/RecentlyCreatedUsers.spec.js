import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import RecentlyCreatedUsers from '../RecentlyCreatedUsers';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = numberOfUsers => {
	return {
		Items: [
			{
				hasLink: () => true,
				getLink: () => 'mockLink',
			},
		],
		getBatch: () => {
			let Items = [];

			for (let i = 0; i < numberOfUsers; i++) {
				const index = i + 1;

				Items.push({
					alias: 'user' + index,
					getCreatedTime: () => new Date('10/30/2018'),
				});
			}

			return Promise.resolve({
				Items,
				Total: Items.length,
			});
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
describe('Site admin dashboard widget recently created users (5 users total)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<RecentlyCreatedUsers />);
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});

describe('Site admin dashboard widget recently created users (3 users total)', () => {
	beforeEach(() => onBefore(3));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<RecentlyCreatedUsers />);
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});

describe('Site admin dashboard widget recently created users (no users)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<RecentlyCreatedUsers />);
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
