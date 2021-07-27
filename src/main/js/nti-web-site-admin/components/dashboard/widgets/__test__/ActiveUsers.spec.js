import React from 'react';
import { create, act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import { ActiveUsers } from '../ActiveUsers';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = Count => {
	return {
		getCollection: () => {
			return {
				hasLink: () => true,
				getLink: () => 'mockLink',
			};
		},
		get: () => {
			return Promise.resolve({
				Count,
			});
		},
	};
};

const onBefore = count => {
	jest.useFakeTimers();
	setupTestClient(getMockService(count));
};

const onAfter = () => {
	tearDownTestClient();
};

/* eslint-env jest */
describe('Site admin dashboard widget active sessions (with 5 count)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		await act(async () => {
			cmp = create(<ActiveUsers />);
			jest.runAllTimers();
			await flushPromises();
			jest.runAllTimers();
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});

describe('Site admin dashboard widget active sessions (with 0 count)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		await act(async () => {
			cmp = create(<ActiveUsers />);
			jest.runAllTimers();
			await flushPromises();
			jest.runAllTimers();
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
