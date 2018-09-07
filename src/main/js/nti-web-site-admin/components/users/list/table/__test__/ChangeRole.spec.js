/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import ChangeRole from '../ChangeRole';

const SAMPLE_USERS = [
	{
		'Username': 'user1',
		getID: () => 'user1'
	},
	{
		'Username': 'user2',
		getID: () => 'user2'
	}
];

describe('Site admin user table change role test', () => {
	test('Test learner list', () => {
		const changeRoleCmp = renderer.create(<ChangeRole selectedUsers={SAMPLE_USERS}/>);

		const tree = changeRoleCmp.toJSON();

		// two user items in the list, role radio should default as 'Learner'
		expect(tree).toMatchSnapshot();
	});

	test('Test admin list', () => {
		const changeRoleCmp = renderer.create(<ChangeRole selectedUsers={SAMPLE_USERS} removing/>);

		const tree = changeRoleCmp.toJSON();

		// two user items in the list, role radio should default as 'Admin'
		expect(tree).toMatchSnapshot();
	});
});
