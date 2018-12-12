import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import Frame from '../Frame';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = () => {
	return {
		resolveEntity: () => {
			return {
				hasLink: () => true,
				fetchLink: () => {
					return {};
				}
			};
		},
		getObject: () => {
			return {
				title: 'abc'
			};
		}
	};
};

const onBefore = () => {
	jest.useFakeTimers();
	setupTestClient(getMockService());
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin user frame test', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<Frame userID="user1"/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
