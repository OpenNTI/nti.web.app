import React from 'react';
import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = () => {
	return {
		getObject: () => {
			return {
				title: 'abc',
			};
		},
		get: link => {
			if (link === 'mockAnalytics') {
				return Promise.resolve({
					Links: [
						{
							rel: 'active_times_summary',
							href: 'mockActiveTimes',
						},
					],
				});
			} else if (link === 'mockActiveTimes') {
				return Promise.resolve({});
			}
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
describe('Site admin user course overview test', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test', async () => {
		const course = {
			hasLink: () => true,
			fetchLink: () => {
				return Promise.resolve({
					Items: [],
				});
			},
			Links: [
				{
					rel: 'analytics',
					href: 'mockAnalytics',
				},
			],
			getLink: () => 'mockEntityLink',
		};

		let cmp;
		act(() => {
			cmp = renderer.create(<View course={course} />);
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
