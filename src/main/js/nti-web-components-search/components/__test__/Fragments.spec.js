import React from 'react';
import { shallow } from 'enzyme';

import Fragments from '../Fragments';

describe('<Fragments />', () => {

	function buildProps (props) {
		const newProps = {props};

		spyOn(newProps, 'onChange');

		return newProps;
	}

	it('should render a `.hit-fragments`', () => {
		const wrapper = shallow(<Fragments />);
		expect(wrapper.find('.hit-fragments')).to.have.length(1);
	});

	it('should render at least one `.hit-fragment`', () => {
		const wrapper = shallow(<Fragments />);
		expect(wrapper.contains(<div className= "hit-fragment" />)).to.equal(true);
	});

	it('simulates click events on fragments', () => {
		const inputProps = buildProps({});

		const wrapper = shallow(<Fragments />);
		wrapper.find('.hit-fragment').simulate('click');
		expect(inputProps.navigateToSearchHit).toHaveBeenCalled();
	});
});
