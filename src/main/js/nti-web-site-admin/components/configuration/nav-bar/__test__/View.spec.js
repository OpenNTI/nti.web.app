import React from 'react';
import renderer from 'react-test-renderer';

import View from '../View';

/* eslint-env jest */
describe('Site admin advanced nav bar test', () => {
	test('Basic render test', async () => {
		const cmp = renderer.create(<View/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
