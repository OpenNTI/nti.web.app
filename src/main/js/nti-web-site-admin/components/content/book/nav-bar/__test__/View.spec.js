import React from 'react';
import renderer from 'react-test-renderer';

import View from '../View';

/* eslint-env jest */
//TODO: make this more useful
describe.skip('Site admin user book nav bar test', () => {
	test('Basic render test', async () => {
		const book = {
			title: 'book1',
			getDefaultAssetRoot() {
				return 'testRoot';
			},
		};

		const cmp = renderer.create(<View book={book} />);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
