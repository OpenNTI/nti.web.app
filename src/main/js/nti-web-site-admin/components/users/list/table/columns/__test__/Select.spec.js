/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import Select from '../Select';

describe('Site admin user table select column test', () => {
	test('Test not selected', () => {
		const colCmp = renderer.create(<Select
			isSelected={(item)=>{
				return item.id === 'selectedUser';
			}}
			item={{
				id: 'unselectedUser'
			}}/>);

		const tree = colCmp.toJSON();

		// should have a checked=false checkbox and no row-selected class
		expect(tree).toMatchSnapshot();
	});

	test('Test selected', () => {
		const colCmp = renderer.create(<Select
			isSelected={(item)=>{
				return item.id === 'selectedUser';
			}}
			item={{
				id: 'selectedUser'
			}}/>);

		const tree = colCmp.toJSON();

		// should have a checked=true checkbox and a row-selected class
		expect(tree).toMatchSnapshot();
	});
});
