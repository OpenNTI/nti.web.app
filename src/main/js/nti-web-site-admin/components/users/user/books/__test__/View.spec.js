import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (numberOfBooks) => {
	let Items = [];

	for(let i = 0; i < numberOfBooks; i++) {
		const index = i + 1;

		Items.push({
			Bundle: {
				getPresentationProperties: () => {
					return {
						label: 'Book' + index,
						title: 'book' + index
					};
				}
			}
		});
	}

	return {
		getBatch: () => {
			return {
				Items
			};
		}
	};
};

const onBefore = (numberOfBooks) => {
	jest.useFakeTimers();
	setupTestClient(getMockService(numberOfBooks));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin user book list test (5 books)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const user = {
			getLink: () => 'mockLink'
		};

		const cmp = renderer.create(<View user={user}/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin user book list test (no books)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const user = {
			getLink: () => 'mockLink'
		};

		const cmp = renderer.create(<View user={user}/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
