import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Text} from '@nti/web-login/shared';
import {Prompt, Button, Theme} from '@nti/web-commons';

import Styles from './View.css';

const cx = classnames.bind(Styles);
const t = scoped('nti-web-app.admin.login.preview', {
	save: 'Apply Changes'
});

LoginPreview.propTypes = {
	onSave: PropTypes.func,
	onCancel: PropTypes.func
};
export default function LoginPreview ({onSave, onCancel}) {
	const background = Theme.useThemeProperty('login.background');

	const containerStyles = {};

	if (background && background.href) {
		containerStyles.backgroundImage = `url(${background.href})`;
	}

	const buttonStyle = {
		backgroundColor: Theme.useThemeProperty('login.buttonBackground')
	};

	return (
		<Prompt.Dialog>
			<div className={cx('login-preview')}>
				<i className={cx('close', 'icon-light-x')} onClick={onCancel} />
				<div className={cx('preview-container')}>
					<div className={cx('preview')} style={containerStyles}>
						<div className={cx('feature')}>
							<Theme.Asset name="login.featured" />
						</div>
						<div className={cx('content')}>
							<div className={cx('header')}>
								<Theme.Asset name="login.logo" />
							</div>
							<div className={cx('login')}>
								<Text.H1>{Theme.useThemeProperty('login.title')}</Text.H1>
								<Text.Large>{Theme.useThemeProperty('login.description')}</Text.Large>
								<div className={cx('form')}>
									<div className={cx('input')} />
									<div className={cx('input')} />
									<div className={cx('button', Theme.useThemeProperty('login.buttonThemes'))} style={buttonStyle}>
										{Theme.useThemeProperty('login.buttonText')}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{onSave && (
					<div className={cx('controls')}>
						<Button onClick={onSave}>{t('save')}</Button>
					</div>
				)}
			</div>
		</Prompt.Dialog>
	);
}