import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = numberOfCourses => {
	let Items = [];

	for (let i = 0; i < numberOfCourses; i++) {
		const index = i + 1;

		Items.push({
			getPresentationProperties: () => {
				return {
					label: 'Course' + index,
					title: 'course' + index,
				};
			},
			hasLink: () => true,
		});
	}

	return {
		getBatch: () => {
			return {
				Items,
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
describe('Site admin user course list test (5 courses)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const user = {
			getLink: () => 'mockLink',
			hasLink: () => true,
		};

		let cmp;
		act(() => {
			cmp = renderer.create(<View user={user} />);
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});

describe('Site admin user course list test (no courses)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const user = {
			getLink: () => 'mockLink',
			hasLink: () => true,
		};

		let cmp;
		act(() => {
			cmp = renderer.create(<View user={user} />);
		});

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
