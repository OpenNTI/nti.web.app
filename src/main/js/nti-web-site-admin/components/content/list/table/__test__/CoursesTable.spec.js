import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import CoursesTable from '../CoursesTable';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (numberOfCourses) => {
	return {
		getCollection: (name) => {
			return {
				hasLink: () => true,
				getLink: () => 'mockLink',
				accepts: []
			};
		},
		getBatch: () => {
			let Items = [];

			for(let i = 0; i < numberOfCourses; i++) {
				const index = i + 1;

				Items.push({
					getID: () => 'course' + index,
					getStartDate: () => new Date('10/30/2017'),
					getEndDate: () => new Date('11/25/2017'),
					getDefaultAssetRoot: () => 'testRoot',
					CatalogEntry: {
						Title: 'course' + index,
						getStartDate: () => new Date('10/30/2017'),
						getEndDate: () => new Date('11/25/2017'),
						getDefaultAssetRoot: () => 'testRoot',
						TotalEnrolledCount: i
					}
				});
			}

			return Promise.resolve({
				Total: numberOfCourses,
				BatchPage: 1,
				Items
			});
		},
		getWorkspace: () => {
			return {
				getLink: () => 'mockLink'
			};
		}
	};
};

const onBefore = (numberOfCourses) => {
	jest.useFakeTimers();
	setupTestClient(getMockService(numberOfCourses));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin content course list (with no items)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<CoursesTable/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin content course list (with 5 items)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<CoursesTable/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin content course list (with 25 items)', () => {
	beforeEach(() => onBefore(25));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<CoursesTable/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
