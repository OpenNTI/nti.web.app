/* eslint-env jest */
import { create, act } from 'react-test-renderer';

import Rescind from '../Rescind';

describe('Site admin user table join date column test', () => {
	test('Test none selected', () => {
		let cmp;
		act(() => {
			cmp = create(
				<Rescind
					getSelectedCount={() => {
						return 0;
					}}
					item={{
						receiver: 'invited1',
					}}
				/>
			);
		});

		const tree = cmp.toJSON();

		// when none are selected, the "Cancel" button will be shown
		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});

	test('Test some selected', () => {
		let cmp;
		act(() => {
			cmp = create(
				<Rescind
					getSelectedCount={() => {
						return 5;
					}}
					item={{
						receiver: 'invited1',
					}}
				/>
			);
		});

		const tree = cmp.toJSON();

		// when some are selected, the "Cancel" button won't be shown (instead, the bulk Cancel Invitation button is used)
		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
