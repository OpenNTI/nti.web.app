import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import Frame from '../Frame';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (hasData) => {
	return {};
};

const onBefore = (hasData) => {
	jest.useFakeTimers();
	setupTestClient(getMockService(hasData));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin user course enrollment frame', () => {
	beforeEach(() => onBefore(true));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<Frame/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
