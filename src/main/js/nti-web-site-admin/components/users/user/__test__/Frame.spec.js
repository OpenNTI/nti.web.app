import React from 'react';
import renderer from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import Frame from '../Frame';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = () => {
	return {
		resolveEntity: () => {
			return {
				hasLink: () => true,
				fetchLink: () => {
					return {};
				},
				avatarURL: 'someAvatarURL',
			};
		},
		getObject: () => {
			return {
				title: 'abc',
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
describe.skip('Site admin user frame test', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<Frame userID="user1" />);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
