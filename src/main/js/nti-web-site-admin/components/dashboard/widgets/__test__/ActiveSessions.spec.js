import React from 'react';
import renderer from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import ActiveSessions from '../ActiveSessions';

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
		const cmp = renderer.create(<ActiveSessions />);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin dashboard widget active sessions (with 0 count)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<ActiveSessions />);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
