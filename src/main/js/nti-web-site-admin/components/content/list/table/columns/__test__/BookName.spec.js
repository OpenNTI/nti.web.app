/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import BookName from '../BookName';

describe('Site admin content table book name column test', () => {
	test('Test name', () => {
		const colCmp = renderer.create(<BookName item={{
			title: 'book name',
			getID: () => 'bookName'
		}}/>);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
