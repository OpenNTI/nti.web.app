import { create, act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';
import { Date as DateUtils } from '@nti/lib-commons';

import ActiveTimes from '../ActiveTimes';

import { mockActiveTimeData } from './active-time-data';

const { tearDownTestClient, setupTestClient } = TestUtils;
const { MockDate } = DateUtils;

const getMockService = () => {
	return {
		getCollection: () => {
			return {
				hasLink: () => true,
				getLink: () => 'mockLink',
			};
		},
		getWorkspace: () => {
			return {};
		},
		get: () => {
			return Promise.resolve(mockActiveTimeData);
		},
	};
};

const onBefore = () => {
	jest.useFakeTimers();
	setupTestClient(getMockService());
};

const onAfter = () => {
	tearDownTestClient();
};

/* eslint-env jest */
describe('Site admin dashboard widget active times', () => {
	const actingDate = new Date('10/31/2018');
	MockDate.install(actingDate);

	beforeEach(() => onBefore());
	afterEach(onAfter);

	afterAll(() => {
		MockDate.uninstall();
	});

	test('Basic render test', async () => {
		let cmp;
		await act(async () => {
			cmp = create(<ActiveTimes />);

			jest.runAllTimers();
			await flushPromises();
			jest.runAllTimers();
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
