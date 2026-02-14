function Logo({ className }) {
	return (
		<svg
			className={className}
			viewBox="0 0 128 128"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="24"
				y="36"
				width="80"
				height="72"
				rx="16"
				stroke="currentColor"
				strokeWidth="6"
			/>

			<path
				d="M44 36C44 24 52 16 64 16C76 16 84 24 84 36"
				stroke="currentColor"
				strokeWidth="6"
				strokeLinecap="round"
			/>

			<path
				d="M64 56C56.82 56 51 61.82 51 69C51 78.5 64 92 64 92C64 92 77 78.5 77 69C77 61.82 71.18 56 64 56Z"
				stroke="currentColor"
				strokeWidth="6"
				fill="none"
			/>

			<circle cx="64" cy="69" r="4" fill="currentColor" />
		</svg>
	)
}

export default Logo
