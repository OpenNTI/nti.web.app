import React from 'react';
import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';

import View from '../View';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = () => {
	return {};
};

const onBefore = () => {
	jest.useFakeTimers();
	setupTestClient(getMockService());
};

const onAfter = () => {
	tearDownTestClient();
};

/* eslint-env jest */
describe('Site admin user book enrollment nav bar test', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test', async () => {
		const user = {
			Username: 'testUser',
		};

		const book = {
			title: 'book1',
			getDefaultAssetRoot() {
				return 'testRoot';
			},
		};

		let cmp;
		act(() => {
			cmp = renderer.create(<View user={user} book={book} />);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
