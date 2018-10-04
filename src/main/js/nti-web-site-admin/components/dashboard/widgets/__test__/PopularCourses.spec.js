import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import PopularCourses from '../PopularCourses';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (numberOfCourses, hasBatchPrev) => {
	return {
		getCollection: () => {
			return {
				hasLink: () => true,
				getLink: () => 'mockLink'
			};
		},
		getWorkspace: () => {
			return {};
		},
		getBatch: () => {
			let Items = [];

			for(let i = 0; i < numberOfCourses; i++) {
				const index = i + 1;

				Items.push({
					Title: 'course' + index,
					ProviderUniqueID: 'COURSE' + index,
					TotalEnrolledCount: 100 - index
				});
			}

			return Promise.resolve({
				Items,
				Total: Items.length,
				getLink: (link) => {
					if(link === 'batch-prev') {
						return hasBatchPrev;
					}
					else if(link === 'batch-next') {
						return numberOfCourses > 4;
					}

					return false;
				}
			});
		}
	};
};

const onBefore = (numberOfCourses, hasBatchPrev) => {
	jest.useFakeTimers();
	setupTestClient(getMockService(numberOfCourses, hasBatchPrev));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin dashboard widget popular courses (5 items, no previous)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<PopularCourses/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin dashboard widget popular courses (3 items, has previous)', () => {
	beforeEach(() => onBefore(3, true));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<PopularCourses/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin dashboard widget popular courses (no items, no previous)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<PopularCourses/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
