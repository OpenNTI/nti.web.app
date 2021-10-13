import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = () => {
	return {
		getBatch: () => {
			return {
				getLink: () => 'mockLink',
			};
		},
		get: () => {
			let historicalSessions = [];

			for (let i = 0; i < 10; i++) {
				historicalSessions.push({
					SessionStartTime:
						new Date('10/30/2017').getTime() / 1000 + i * 60,
				});
			}

			return Promise.resolve({
				Items: historicalSessions,
			});
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
describe('Site admin user overview view', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test', async () => {
		const user = {
			getLink: () => 'mockLink',
			getCreatedTime: () => new Date('10/10/2017'),
		};

		let cmp;
		act(() => {
			cmp = renderer.create(<View user={user} />);
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
