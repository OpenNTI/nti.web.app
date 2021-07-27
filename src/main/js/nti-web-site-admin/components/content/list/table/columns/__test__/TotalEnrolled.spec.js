/* eslint-env jest */
import React from 'react';
import { create, act } from 'react-test-renderer';

import TotalEnrolled from '../TotalEnrolled';

describe('Site admin content table total enrolled column test', () => {
	test('Test no catalog entry', () => {
		let cmp;
		act(() => {
			cmp = create(<TotalEnrolled item={{}} />);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});

	test('Test catalog entry, but no TotalEnrolled', () => {
		let cmp;
		act(() => {
			cmp = create(
				<TotalEnrolled
					item={{
						CatalogEntry: {},
					}}
				/>
			);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});

	test('Test catalog entry with non-zero TotalEnrolled', () => {
		let cmp;
		act(() => {
			cmp = create(
				<TotalEnrolled
					item={{
						CatalogEntry: {
							TotalEnrolledCount: 6,
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
