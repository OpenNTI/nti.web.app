/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import EndDate from '../EndDate';

describe('Site admin content table end date column test', () => {
	const verifyColumn = date => {
		const colCmp = renderer.create(
			<EndDate
				item={{
					getEndDate: () => {
						return date;
					},
				}}
			/>
		);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	};

	test('Test date is many days ago', () => {
		// label should show date formatted as "Oct 31, 2017"
		verifyColumn(new Date('10/31/2017'));
	});
});
