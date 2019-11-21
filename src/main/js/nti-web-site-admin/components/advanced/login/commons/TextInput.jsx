import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Input} from '@nti/web-commons';

import Store from '../Store';

import Styles from './TextInput.css';

const cx = classnames.bind(Styles);

TextInput.propTypes = {
	value: PropTypes.string,
	name: PropTypes.string,
	type: PropTypes.string,
	setBrandProp: PropTypes.func
};
function TextInput ({value, name, type, setBrandProp}) {
	/*
		There is a react update priority issue here, where just broadcasting the change to
		the store is causing the inputs to re-render and move focus to the end. To counteract
		this we are tracking the value in local state so it updates with a higher priority
	 */
	const [text, setText] = React.useState(value);

	const onChange = (change) => {
		setBrandProp(name, change);
		setText(change);
	};

	return (
		<div className={cx('text-input', type)}>
			<Input.TextArea
				value={text}
				onChange={onChange}
				autoGrow
			/>
		</div>
	);
}

export default Store
	.monitor({
		[Store.SetBrandProp]: 'setBrandProp'
	})(TextInput);