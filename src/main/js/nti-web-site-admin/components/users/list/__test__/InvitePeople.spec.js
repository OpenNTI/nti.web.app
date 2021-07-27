/* eslint-env jest */
import React from 'react';
import { act, create } from 'react-test-renderer';

import InvitePeople from '../InvitePeople';

describe('Site admin user table invite dialog test', () => {
	test('General Snapshot', () => {
		let cmp;
		act(() => {
			cmp = create(
				<InvitePeople
					loading={false}
					clearInviteError={() => {}}
					hideInviteDialog={() => {}}
					sendLearnerInvites={() => {}}
					sendAdminInvites={() => {}}
				/>
			);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
