/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import InviteDate from '../InviteDate';

describe('Site admin user table invite date column test', () => {
	const verifyColumn = (date) => {
		const colCmp = renderer.create(<InviteDate item={{
			getCreatedTime: () => {
				return date;
			}
		}}/>);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	};

	test('Test date is now', () => {
		// label should say "Today"
		verifyColumn(Date.now());
	});

	test('Test date is yesterday', () => {
		// label should say "Yesterday"
		verifyColumn(new Date(Date.now() - 1000 * 60 * 60 * 24));
	});

	test('Test date is many days ago', () => {
		// label should show the formatted date as "Oct 31, 2017"
		verifyColumn(new Date('10/31/2017'));
	});
});
