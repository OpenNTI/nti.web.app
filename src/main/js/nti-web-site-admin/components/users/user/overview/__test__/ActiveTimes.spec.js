import { create, act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';
import { Date as DateUtils } from '@nti/lib-commons';

import ActiveTimes from '../ActiveTimes';
import { mockActiveTimeData } from '../../../../dashboard/widgets/__test__/active-time-data';

const { tearDownTestClient, setupTestClient } = TestUtils;
const { MockDate } = DateUtils;

const getMockService = () => {
	return {
		getBatch: () => {
			return {
				getLink: () => 'mockLink',
			};
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
describe('Site admin user overview active times', () => {
	const actingDate = new Date('10/31/2018');
	MockDate.install(actingDate);

	afterAll(() => {
		MockDate.uninstall();
	});

	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test', async () => {
		const user = {
			getLink: () => 'mockLink',
		};

		let cmp;
		await act(async () => {
			cmp = create(<ActiveTimes user={user} />);

			jest.runAllTimers();
			await flushPromises();
			jest.runAllTimers();
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
