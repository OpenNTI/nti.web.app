/* eslint-env jest */
import React from 'react';
import { create, act } from 'react-test-renderer';

import CourseName from '../CourseName';

describe('Site admin content table course name column test', () => {
	test('Test name', () => {
		let cmp;
		act(() => {
			cmp = create(
				<CourseName
					item={{
						CatalogEntry: {
							getStartDate: () => new Date('2/1/2017'),
							getEndDate: () => new Date('4/5/2017'),
							Title: 'Test course',
							ProviderUniqueID: 'testCourse',
							getDefaultAssetRoot() {
								return 'testRoot';
							},
						},
					}}
				/>
			);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
