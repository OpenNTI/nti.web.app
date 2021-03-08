import React from 'react';
import renderer from 'react-test-renderer';

import { TestUtils } from '@nti/web-client';

import Frame from '../Frame';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = () => {
	return {
		getObject: () => {
			return {
				title: 'abc',
				getDefaultAssetRoot() {
					return 'testRoot';
				},
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

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe.skip('Site admin user book frame test', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<Frame bookID="book1" />);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
