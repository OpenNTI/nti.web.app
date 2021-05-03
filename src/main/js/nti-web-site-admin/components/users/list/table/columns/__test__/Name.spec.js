/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';

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

	test('Test for learners', () => {
		const colCmp = renderer.create(
			<Name
				item={{
					email: 'user@blah.com',
					getID: () => 'user',
				}}
				store={{
					filter: 'learners',
				}}
			/>
		);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Test for admins', () => {
		const colCmp = renderer.create(
			<Name
				item={{
					email: 'user@blah.com',
					getID: () => 'user',
				}}
				store={{
					filter: 'admins',
				}}
			/>
		);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
