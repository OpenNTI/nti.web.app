/* eslint-env jest */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import * as TestUtils from '@nti/web-client/test-utils';
import { flushPromises } from '@nti/lib-commons/test-utils';

import InvitationsTable from '../InvitationsTable';

const { tearDownTestClient, setupTestClient } = TestUtils;

const getMockService = numberOfUsers => {
	return {
		getCollection: () => {
			return {
				hasLink: () => true,
				getLink: () => 'mockLink',
			};
		},
		async getBatch() {
			let Items = [];

			for (let i = 0; i < numberOfUsers; i++) {
				const index = i + 1;

				let MimeType = 'nextthought.';

				if (i % 2 === 0) {
					MimeType += 'siteadmininvitation';
				} else {
					MimeType += 'siteinvitation';
				}

				Items.push({
					Username: 'test' + index,
					getID: () => 'test' + index,
					receiver: 'test' + index + '@blah.com',
					MimeType,
					getCreatedTime: () => new Date('10/30/2017'),
					getLastSeenTime: () =>
						new Date(Date.now() - 1000 * 60 * 60 * 24 * index), // last seen i days ago
				});
			}

			return {
				Total: numberOfUsers,
				BatchPage: 1,
				Items,
			};
		},
		getWorkspace: () => {
			return {
				getLink: () => 'mockLink',
			};
		},
	};
};

async function pollForState(testRenderer, Component, test, timeout = 5000) {
	let start = new Date();

	const target = Component.WrappedComponent || Component;
	const cmp = testRenderer.root.findByType(target);

	do {
		await flushPromises();

		if (new Date() - start > timeout) {
			throw new Error('Timed out waiting for loading state to be false');
		}
	} while (test(cmp));
}

describe('Site admin user invitations list (with no items)', () => {
	for (let i of [0, 5, 25]) {
		describe(
			'Site admin user invitations list (with ' + i + ' items)',
			() => {
				beforeEach(() => {
					jest.useFakeTimers();
					setupTestClient(getMockService(i));
				});

				afterEach(() => {
					tearDownTestClient();
				});

				test('Basic render test', async () => {
					let testRenderer;
					act(() => {
						testRenderer = renderer.create(<InvitationsTable />, {
							createNodeMock: element => element,
						});
					});

					await act(() =>
						pollForState(
							testRenderer,
							InvitationsTable,
							cmp => cmp.props.loading
						)
					);

					const tree = testRenderer.toJSON();

					expect(tree).toMatchSnapshot();
					testRenderer.unmount();
				});
			}
		);
	}
});
