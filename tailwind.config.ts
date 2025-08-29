import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'heading': ['Inter', 'system-ui', 'sans-serif'],
				'body': ['Crimson Text', 'Georgia', 'serif'],
				'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				'border-subtle': 'hsl(var(--border-subtle))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				'page-background': 'hsl(var(--page-background))',
				
				/* Content Hierarchy */
				heading: 'hsl(var(--heading))',
				subheading: 'hsl(var(--subheading))',
				'body-text': 'hsl(var(--body-text))',
				'muted-text': 'hsl(var(--muted-text))',
				
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					muted: 'hsl(var(--primary-muted))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border))'
				},
				
				/* Content Boxes */
				'intuition-bg': 'hsl(var(--intuition-bg))',
				'intuition-border': 'hsl(var(--intuition-border))',
				'approach-bg': 'hsl(var(--approach-bg))',
				'approach-border': 'hsl(var(--approach-border))',
				'example-bg': 'hsl(var(--example-bg))',
				'example-border': 'hsl(var(--example-border))',
				'complexity-bg': 'hsl(var(--complexity-bg))',
				'complexity-border': 'hsl(var(--complexity-border))',
				'revision-bg': 'hsl(var(--revision-bg))',
				'revision-border': 'hsl(var(--revision-border))',
				
				/* Code Colors */
				'code-bg': 'hsl(var(--code-bg))',
				'code-border': 'hsl(var(--code-border))',
				'syntax-keyword': 'hsl(var(--syntax-keyword))',
				'syntax-string': 'hsl(var(--syntax-string))',
				'syntax-comment': 'hsl(var(--syntax-comment))'
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'content': 'var(--shadow-content)',
				'elevated': 'var(--shadow-elevated)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [
        require("tailwindcss-animate"),
        require("@tailwindcss/typography"), // <-- ADD THIS LINE
    ],
} satisfies Config;
