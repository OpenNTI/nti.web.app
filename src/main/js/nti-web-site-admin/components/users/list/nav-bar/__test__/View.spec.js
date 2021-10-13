import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = canSendInvitations => {
	return {
		getCollection: () => {
			return {
				hasLink: () => canSendInvitations,
				getLink: () => 'mockLink',
			};
		},
		getBatch: () => {
			return Promise.resolve({
				total: 5,
			});
		},
	};
};

const onBefore = canSendInvitations => {
	jest.useFakeTimers();
	setupTestClient(getMockService(canSendInvitations));
};

const onAfter = () => {
	tearDownTestClient();
};

/* eslint-env jest */
describe('Site admin user list nav bar (with invite link)', () => {
	beforeEach(() => onBefore(true));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<View />);
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});

describe('Site admin user list nav bar (without invite link)', () => {
	beforeEach(() => onBefore(false));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<View />);
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
