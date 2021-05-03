import React from 'react';
import renderer from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = () => {
	return {};
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
describe('Site admin user book reports test', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test', async () => {
		const course = {};

		const cmp = renderer.create(<View course={course} />);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
