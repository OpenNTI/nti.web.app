import React from 'react';
import renderer from 'react-test-renderer';
import { TestUtils } from '@nti/web-client';

import InvitationsTable from '../InvitationsTable';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = (numberOfUsers) => {
	return {
		getCollection: () => {
			return {
				hasLink: () => true,
				getLink: () => 'mockLink'
			};
		},
		getBatch: () => {
			let Items = [];

			for(let i = 0; i < numberOfUsers; i++) {
				const index = i + 1;

				let MimeType = 'nextthought.';

				if(i % 2 === 0) {
					MimeType += 'siteadmininvitation';
				}
				else {
					MimeType += 'siteinvitation';
				}

				Items.push({
					Username: 'test' + index,
					getID: () => 'test' + index,
					receiver: 'test' + index + '@blah.com',
					MimeType,
					getCreatedTime: () => new Date('10/30/2017'),
					getLastSeenTime: () => new Date(Date.now() - 1000 * 60 * 60 * 24 * index) // last seen i days ago
				});
			}

			return Promise.resolve({
				Total: numberOfUsers,
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

const onBefore = (numberOfUsers) => {
	jest.useFakeTimers();
	setupTestClient(getMockService(numberOfUsers));
};

const onAfter = () => {
	tearDownTestClient();
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/* eslint-env jest */
describe('Site admin user invitations list (with no items)', () => {
	beforeEach(() => onBefore(0));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<InvitationsTable/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin user invitations list (with 5 items)', () => {
	beforeEach(() => onBefore(5));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<InvitationsTable/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});

describe('Site admin user invitations list (with 25 items)', () => {
	beforeEach(() => onBefore(25));
	afterEach(onAfter);

	test('Basic render test', async () => {
		const cmp = renderer.create(<InvitationsTable/>);

		jest.runAllTimers();
		await flushPromises();
		jest.runAllTimers();

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
