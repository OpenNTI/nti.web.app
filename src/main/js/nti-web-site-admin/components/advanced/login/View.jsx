import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme, Loading, Errors} from '@nti/web-commons';

import Card from '../../common/Card';
import Controls from '../branding/Controls';

import Store from './Store';
import Styles from './View.css';
import Logo from './sections/Logo';
import Headline from './sections/Headline';
import Description from './sections/Description';
import SubText from './sections/SubText';
import LoginButton from './sections/LoginButton';
import Assets from './sections/Assets';

const cx = classnames.bind(Styles);

AdvancedLogin.propTypes = {
	error: PropTypes.any,
	loading: PropTypes.bool,
	modified: PropTypes.bool,
	theme: PropTypes.object,
	save: PropTypes.func,
	cancel: PropTypes.func,
	reset: PropTypes.func
};
function AdvancedLogin ({error, loading, modified, theme, save, cancel, reset}) {
	if (!theme) { return null; }

	const form = React.createRef();

	const onSave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		save(form.current);
	};

	return (
		<Theme.Apply theme={theme}>
			<form className={cx('login-root')} ref={form} onSubmit={onSave}>
				<Card>
					{(modified || error) && (
						<div className={cx('header')}>
							<div className={cx('header-content')}>
								<Controls onPreview={onSave} onCancel={cancel} />
								{error && <Errors.Bar error={error} className={cx('errorbar')}/>}
							</div>
						</div>
					)}
					<div className={cx('login-content')}>
						<Logo />
						<Headline />
						<Description />
						<SubText />
						<LoginButton />
						<Assets />
					</div>
				</Card>
				<Loading.Overlay large loading={loading} />
			</form>
		</Theme.Apply>
	);
}

export default Store
	.connect({
		[Store.Error]: 'error',
		[Store.Loading]: 'loading',
		[Store.Modified]: 'modified',
		[Store.Theme]: 'theme',
		[Store.Save]: 'save',
		[Store.Cancel]: 'cancel',
		[Store.Reset]: 'reset'
	})(AdvancedLogin);