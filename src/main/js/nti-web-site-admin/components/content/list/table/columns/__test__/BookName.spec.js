/* eslint-env jest */
import React from 'react';
import { create, act } from 'react-test-renderer';

import BookName from '../BookName';

describe('Site admin content table book name column test', () => {
	test('Test name', () => {
		let cmp;
		act(() => {
			cmp = create(
				<BookName
					item={{
						title: 'book name',
						getID: () => 'bookName',
						getDefaultAssetRoot() {
							return 'testRoot';
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
