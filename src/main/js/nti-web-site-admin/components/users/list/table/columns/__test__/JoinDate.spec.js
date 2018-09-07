/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import JoinDate from '../JoinDate';

describe('Site admin user table join date column test', () => {
	const verifyColumn = (date) => {
		const colCmp = renderer.create(<JoinDate item={{
			getCreatedTime: () => {
				return date;
			}
		}}/>);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	};

	test('Test date is many days ago', () => {
		// label should show date formatted as "Oct 31, 2017"
		verifyColumn(new Date('10/31/2017'));
	});
});
