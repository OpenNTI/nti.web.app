import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (canSendInvitations) => {
	return {
		getCollection: () => {
			return {
				hasLink: () => canSendInvitations,
				getLink: () => 'mockLink'
			};
		},
		getBatch: () => {
			return Promise.resolve({
				Total: 5
			});
		}
	};
};

const onBefore = (canSendInvitations) => {
	jest.useFakeTimers();
	setupTestClient(getMockService(canSendInvitations));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin user list nav bar (with invite link)', () => {
	beforeEach(() => onBefore(true));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<View/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin user list nav bar (without invite link)', () => {
	beforeEach(() => onBefore(false));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<View/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
