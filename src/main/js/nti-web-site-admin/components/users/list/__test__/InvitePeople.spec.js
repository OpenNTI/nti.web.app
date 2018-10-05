/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import InvitePeople from '../InvitePeople';

describe('Site admin user table invite dialog test', () => {
	test('Test date is now', () => {
		const colCmp = renderer.create(<InvitePeople/>);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
