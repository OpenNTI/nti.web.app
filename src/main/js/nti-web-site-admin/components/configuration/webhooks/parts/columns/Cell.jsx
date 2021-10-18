import { Placeholder, Text } from '@nti/web-core';

export function Cell(props) {
	return (
		<Text
			{...props}
			css={css`
				color: var(--primary-grey);
				font-size: 12px;
				display: block;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
				padding: var(--padding-sm, 0.5em) 0;

				@media (hover: hover) {
					tr:hover & {
						background-color: var(--panel-background-alt);
					}
				}
			`}
		/>
	);
}

Cell.Placeholder = props => (
	<Placeholder.Text
		{...props}
		css={css`
			max-height: 12px;
			margin: var(--padding-sm, 0.5em) 0;
		`}
	/>
);
