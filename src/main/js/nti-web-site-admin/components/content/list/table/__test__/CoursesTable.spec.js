import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import CoursesTable from '../CoursesTable';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = numberOfCourses => {
	return {
		getCollection: name => {
			return {
				hasLink: () => true,
				getLink: () => 'mockLink',
				accepts: [],
			};
		},
		getBatch: () => {
			let Items = [];

			for (let i = 0; i < numberOfCourses; i++) {
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
						TotalEnrolledCount: i,
					},
				});
			}

			return Promise.resolve({
				Total: numberOfCourses,
				BatchPage: 1,
				Items,
			});
		},
		getWorkspace: () => {
			return {
				getLink: () => 'mockLink',
			};
		},
	};
};

const onBefore = numberOfCourses => {
	jest.useFakeTimers();
	setupTestClient(getMockService(numberOfCourses));
};

const onAfter = () => {
	tearDownTestClient();
};

/* eslint-env jest */
describe('Site admin content course list (with no items)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<CoursesTable />, {
				createNodeMock: element => element,
			});
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});

describe('Site admin content course list (with 5 items)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<CoursesTable />, {
				createNodeMock: element => element,
			});
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});

describe('Site admin content course list (with 25 items)', () => {
	beforeEach(() => onBefore(25));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<CoursesTable />, {
				createNodeMock: element => element,
			});
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
