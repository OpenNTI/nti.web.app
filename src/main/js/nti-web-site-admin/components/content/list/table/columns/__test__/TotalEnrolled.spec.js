/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import TotalEnrolled from '../TotalEnrolled';

describe('Site admin content table total enrolled column test', () => {
	test('Test no catalog entry', () => {
		const colCmp = renderer.create(<TotalEnrolled item={{}}/>);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Test catalog entry, but no TotalEnrolled', () => {
		const colCmp = renderer.create(<TotalEnrolled item={{
			CatalogEntry: {}
		}}/>);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Test catalog entry with non-zero TotalEnrolled', () => {
		const colCmp = renderer.create(<TotalEnrolled item={{
			CatalogEntry: {
				TotalEnrolledCount: 6
			}
		}}/>);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
