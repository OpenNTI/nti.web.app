/* eslint-env jest */
import renderer, { act } from 'react-test-renderer';

import ChangeRole from '../ChangeRole';

const SAMPLE_USERS = [
	{
		Username: 'user1',
		getID: () => 'user1',
	},
	{
		Username: 'user2',
		getID: () => 'user2',
	},
];

describe('Site admin user table change role test', () => {
	test('Test learner list', () => {
		let changeRoleCmp;
		act(() => {
			changeRoleCmp = renderer.create(
				<ChangeRole
					addAdmin={() => {}}
					removeAdmin={() => {}}
					selectedUsers={SAMPLE_USERS}
				/>
			);
		});

		const tree = changeRoleCmp.toJSON();

		// two user items in the list, role radio should default as 'Learner'
		expect(tree).toMatchSnapshot();
		changeRoleCmp.unmount();
	});

	test('Test admin list', () => {
		let changeRoleCmp;
		act(() => {
			changeRoleCmp = renderer.create(
				<ChangeRole
					addAdmin={() => {}}
					removeAdmin={() => {}}
					selectedUsers={SAMPLE_USERS}
					removing
				/>
			);
		});

		const tree = changeRoleCmp.toJSON();

		// two user items in the list, role radio should default as 'Admin'
		expect(tree).toMatchSnapshot();
		changeRoleCmp.unmount();
	});
});
