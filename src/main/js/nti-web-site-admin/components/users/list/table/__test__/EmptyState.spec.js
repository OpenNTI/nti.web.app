/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import EmptyState from '../EmptyState';

describe('Site admin user table empty state test', () => {
	test('Test default wording', () => {
		const emptyStateCmp = renderer.create(<EmptyState />);

		const tree = emptyStateCmp.toJSON();

		// should just use the default label for empty component
		expect(tree).toMatchSnapshot();
	});

	test('Test custom wording', () => {
		const emptyStateCmp = renderer.create(<EmptyState message="this is custom text"/>);

		const tree = emptyStateCmp.toJSON();

		// should show "this is custom text"
		expect(tree).toMatchSnapshot();
	});
});
