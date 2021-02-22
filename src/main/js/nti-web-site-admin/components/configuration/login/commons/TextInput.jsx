import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { scoped } from '@nti/lib-locale';
import { Input } from '@nti/web-commons';

import Store from '../Store';

import Styles from './TextInput.css';
import Text from './Text';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-app.admin.login.common.TextInput', {
	remaining: {
		one: '%(count)s Character Left',
		other: '%(count)s Characters Left',
	},
});

TextInput.propTypes = {
	value: PropTypes.string,
	name: PropTypes.string,
	type: PropTypes.string,
	setBrandProp: PropTypes.func,
	maxLength: PropTypes.number,
};
function TextInput({ value, name, type, setBrandProp, maxLength = Infinity }) {
	/*
		There is a react update priority issue here, where just broadcasting the change to
		the store is causing the inputs to re-render and move focus to the end. To counteract
		this we are tracking the value in local state so it updates with a higher priority
	 */
	const [text, setText] = React.useState(value);

	React.useEffect(() => {
		if (text !== value) {
			setText(value);
		}
	}, [value]);

	const onChange = change => {
		if (maxLength && change.length > maxLength) {
			change = change.substr(0, maxLength);
		}

		setBrandProp(name, change);
		setText(change);
	};

	return (
		<div className={cx('text-input', type)}>
			<Input.TextArea value={text} onChange={onChange} autoGrow />
			{maxLength && (
				<Text.Small className={cx('remaining')}>
					{t('remaining', { count: maxLength - text.length })}
				</Text.Small>
			)}
		</div>
	);
}

export default Store.monitor({
	[Store.SetBrandProp]: 'setBrandProp',
})(TextInput);
