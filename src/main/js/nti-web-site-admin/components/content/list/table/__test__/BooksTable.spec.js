import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import BooksTable from '../BooksTable';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = numberOfBooks => {
	return {
		getCollection: () => {
			return {
				hasLink: () => true,
				getLink: () => 'mockLink',
			};
		},
		getBatch: () => {
			let titles = [];

			for (let i = 0; i < numberOfBooks; i++) {
				const index = i + 1;

				titles.push('id' + index);
			}

			return Promise.resolve({
				Total: numberOfBooks,
				BatchPage: 1,
				titles,
			});
		},
		getWorkspace: () => {
			return {
				getLink: () => 'mockLink',
			};
		},
		getObject: id => {
			return {
				title: id,
				getID: () => id,
				getCreatedTime: () => new Date('10/30/2017'),
				getDefaultAssetRoot: () => 'testRoot',
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
describe('Site admin content book list (with no items)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<BooksTable />, {
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

describe('Site admin content book list (with 5 items)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<BooksTable />, {
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

describe('Site admin content book list (with 25 items)', () => {
	beforeEach(() => onBefore(25));
	afterEach(onAfter);

	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<BooksTable />, {
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
