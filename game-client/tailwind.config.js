module.exports = {
	theme: {
		extend: {
			fontFamily: {
				kario: ['Kario', 'ui-sans-serif', 'system-ui'],
				officer: ['Officer Sans', 'ui-sans-serif', 'system-ui'],
				// Set Officer Sans as default sans-serif font
				sans: ['Officer Sans', 'ui-sans-serif', 'system-ui'],
				// Set Kario for headings
				heading: ['Kario', 'ui-sans-serif', 'system-ui']
			}
		}
	},
	daisyui: {
		themes: [
			{
				light: {
					...require('daisyui/src/theming/themes')['light']
				}
			},
			{
				dark: {
					...require('daisyui/src/theming/themes')['dark']
				}
			}
		]
	}
};
