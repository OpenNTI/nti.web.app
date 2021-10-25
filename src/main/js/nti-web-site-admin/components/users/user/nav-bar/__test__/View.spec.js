import { render } from '@testing-library/react';

import * as TestUtils from '@nti/web-client/test-utils';
import { DataContext } from '@nti/web-core/data';

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

const getUser = hasTranscriptLink => {
	return {
		Username: 'testUser',
		getID: () => 'testUser',
		hasLink: () => hasTranscriptLink,
		email: 'testUser@test.com',
	};
};

const Wrapper = ({ user, ...props }) => {
	return <DataContext store={{ user }} {...props} />;
};

/* eslint-env jest */
describe('Site admin user info nav bar test', () => {
	beforeEach(() => onBefore());
	afterEach(onAfter);

	test('Basic render test (has transcript link)', async () => {
		const user = getUser(true);

		const cmp = render(
			<Wrapper user={user}>
				<View user={user} />
			</Wrapper>
		);

		expect(cmp.asFragment()).toMatchSnapshot();
	});

	test('Basic render test (has no transcript link)', async () => {
		const user = getUser(false);

		const cmp = render(
			<Wrapper user={user}>
				<View user={user} />
			</Wrapper>
		);

		expect(cmp.asFragment()).toMatchSnapshot();
	});
});
