import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

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

const getUser = (hasTranscriptLink) => {
	return {
		Username: 'testUser',
		getID: () => 'testUser',
		hasLink: () => hasTranscriptLink,
		email: 'testUser@test.com'
	};
};

/* eslint-env jest */
describe('Site admin user info nav bar test', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test (has transcript link)', async () => {
		const user = getUser(true);

		const cmp = renderer.create(<View user={user}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Basic render test (has no transcript link)', async () => {
		const user = getUser(false);

		const cmp = renderer.create(<View user={user}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
