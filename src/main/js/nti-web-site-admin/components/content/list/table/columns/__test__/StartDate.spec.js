/* eslint-env jest */
import React from 'react';
import { create, act } from 'react-test-renderer';

import StartDate from '../StartDate';

describe('Site admin content table start date column test', () => {
	const verifyColumn = date => {
		let cmp;
		act(() => {
			cmp = create(
				<StartDate
					item={{
						getStartDate: () => {
							return date;
						},
					}}
				/>
			);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	};

	test('Test date is many days ago', () => {
		// label should show date formatted as "Oct 31, 2017"
		verifyColumn(new Date('10/31/2017'));
	});
});
