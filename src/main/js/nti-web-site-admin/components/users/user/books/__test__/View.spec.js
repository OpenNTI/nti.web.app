import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = numberOfBooks => {
	let Items = [];

	for (let i = 0; i < numberOfBooks; i++) {
		const index = i + 1;

		Items.push({
			Bundle: {
				getPresentationProperties: () => {
					return {
						label: 'Book' + index,
						title: 'book' + index,
					};
				},
				getDefaultAssetRoot() {
					return 'testRoot';
				},
			},
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

const onBefore = numberOfBooks => {
	jest.useFakeTimers();
	setupTestClient(getMockService(numberOfBooks));
};

const onAfter = () => {
	tearDownTestClient();
};

/* eslint-env jest */
describe('Site admin user book list test (5 books)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const user = {
			getLink: () => 'mockLink',
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

describe('Site admin user book list test (no books)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const user = {
			getLink: () => 'mockLink',
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
