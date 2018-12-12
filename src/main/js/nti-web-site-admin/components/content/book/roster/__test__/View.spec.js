import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (numberOfItems) => {
	let Items = [];

	for(let i = 0; i < numberOfItems; i++) {
		const index = i + 1;

		Items.push({
			getID: () => 'abc' + index,
			User: {
				Username: 'abc' + index
			}
		});
	}

	return {
		getBatch: () => {
			return Promise.resolve({
				Items,
				Total: Items.length,
				BatchPage: 1
			});
		}
	};
};

const onBefore = (numberOfItems) => {
	jest.useFakeTimers();
	setupTestClient(getMockService(numberOfItems));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin user book roster test (25 items)', () => {
	beforeEach(() => onBefore(25));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const course = {
			getLink: () => 'testLink'
		};

		const cmp = renderer.create(<View course={course}/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin user book roster test (5 items)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const course = {
			getLink: () => 'testLink'
		};

		const cmp = renderer.create(<View course={course}/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin user book roster test (0 items)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const course = {
			getLink: () => 'testLink'
		};

		const cmp = renderer.create(<View course={course}/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
