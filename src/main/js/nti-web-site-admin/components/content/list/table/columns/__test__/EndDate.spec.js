/* eslint-env jest */
import { act, create } from 'react-test-renderer';

import EndDate from '../EndDate';

describe('Site admin content table end date column test', () => {
	const verifyColumn = date => {
		let cmp;
		act(() => {
			cmp = create(
				<EndDate
					item={{
						getEndDate: () => {
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
