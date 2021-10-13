/* eslint-env jest */
import { create, act } from 'react-test-renderer';

import Select from '../Select';

describe('Site admin user table select column test', () => {
	test('Test not selected', () => {
		let cmp;
		act(() => {
			cmp = create(
				<Select
					isSelected={item => {
						return item.id === 'selectedUser';
					}}
					item={{
						id: 'unselectedUser',
					}}
				/>
			);
		});

		const tree = cmp.toJSON();

		// should have a checked=false checkbox and no row-selected class
		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});

	test('Test selected', () => {
		let cmp;
		act(() => {
			cmp = create(
				<Select
					isSelected={item => {
						return item.id === 'selectedUser';
					}}
					item={{
						id: 'selectedUser',
					}}
				/>
			);
		});

		const tree = cmp.toJSON();

		// should have a checked=true checkbox and a row-selected class
		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
