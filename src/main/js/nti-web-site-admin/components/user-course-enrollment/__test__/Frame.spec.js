import { act, create } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import Frame from '../Frame';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = () => {
	return {
		getObject: async () => {
			return {
				fetchLink: () => {
					return {
						course: {
							CatalogEntry: {
								Title: 'course1',
								getDefaultAssetRoot() {
									return 'testRoot';
								},
							},
						},
					};
				},
				UserProfile: 'testUser',
			};
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
describe('Site admin user course enrollment frame', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		await act(async () => {
			cmp = create(<Frame />);

			jest.runAllTimers();
			await flushPromises();
			jest.runAllTimers();
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
