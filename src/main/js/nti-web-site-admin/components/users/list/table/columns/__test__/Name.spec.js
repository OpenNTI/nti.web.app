/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import Name from '../Name';

const { tearDownTestClient, setupTestClient } = TestUtils;

const mockService = {
	resolveEntity: () => Promise.resolve({ displayName: 'User 1' }),
};

const onBefore = () => {
	setupTestClient(mockService);
};

const onAfter = () => {
	tearDownTestClient();
};

describe('Site admin user table name column test', () => {
	beforeEach(onBefore);
	afterEach(onAfter);

	test('Test name', () => {
		const colCmp = renderer.create(<Name item={{
			email: 'user@blah.com',
			getID: () => 'user'
		}}/>);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
