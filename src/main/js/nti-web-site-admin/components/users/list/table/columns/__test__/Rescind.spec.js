/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import Rescind from '../Rescind';

describe('Site admin user table join date column test', () => {
	test('Test none selected', () => {
		const colCmp = renderer.create(<Rescind
			getSelectedCount={()=>{
				return 0;
			}}
			item={{
				receiver: 'invited1'
			}}/>);

		const tree = colCmp.toJSON();

		// when none are selected, the "Cancel" button will be shown
		expect(tree).toMatchSnapshot();
	});

	test('Test some selected', () => {
		const colCmp = renderer.create(<Rescind
			getSelectedCount={()=>{
				return 5;
			}}
			item={{
				receiver: 'invited1'
			}}/>);

		const tree = colCmp.toJSON();

		// when some are selected, the "Cancel" button won't be shown (instead, the bulk Cancel Invitation button is used)
		expect(tree).toMatchSnapshot();
	});
});
