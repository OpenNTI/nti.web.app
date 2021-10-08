import { List } from '@nti/web-commons';

import t from './strings';

const errorRenderers = [
	{
		handles: error =>
			error.code === 'InvalidSiteInvitationData' &&
			error.InvalidEmails &&
			error.InvalidEmails.length > 0,
		render: error => {
			const { InvalidEmails } = error;

			return (
				<>
					<span>
						{t('invalidEmails.message', {
							count: InvalidEmails.length,
						})}
					</span>
					<List.LimitedInline
						limit={2}
						css={css`
							display: inline-flex;
							align-items: center;
							flex-direction: row;
							vertical-align: bottom;
						`}
					>
						{InvalidEmails.map((email, key) => {
							return <span key={key}>{email}</span>;
						})}
					</List.LimitedInline>
				</>
			);
		},
	},
	{
		handles: () => true,
		render: error => error.Message || error.message,
	},
];

export function ErrorMessage({ error }) {
	const renderer = errorRenderers.find(x => x.handles(error));
	if (!renderer) {
		throw new Error('Unknown error type');
	}

	return (
		<div
			className="invite-error"
			css={css`
				padding: 8px 30px;
				font: normal 400 0.875rem/1.25rem var(--body-font-family);
				color: white;
				background: var(--primary-red);
			`}
		>
			{renderer.render(error)}
		</div>
	);
}
