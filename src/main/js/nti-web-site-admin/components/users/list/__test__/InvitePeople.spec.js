/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import InvitePeople from '../InvitePeople';

describe('Site admin user table invite dialog test', () => {
	test('General Snapshot', () => {
		const colCmp = renderer.create(<InvitePeople store={{}} />);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
