
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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				cyrobox: {
					primary: '#4A69B1',
					'primary-dark': '#3A5991',
					'primary-light': '#5A79C1',
				  },
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				brand: {
					purple: 'hsl(214 84% 56%)',
					lightPurple: 'hsl(214 70% 70%)',
					blue: 'hsl(214 84% 56%)',
					darkBlue: 'hsl(220 30% 20%)',
					gray: 'hsl(220 13% 46%)',
					lightGray: 'hsl(220 14% 96%)',
				},
				gradient: {
					primary: 'var(--gradient-primary)',
					background: 'var(--gradient-background)',
					hero: 'var(--gradient-hero)',
					card: 'var(--gradient-card)',
				},
				// macOS/iOS 26 Color Palette
				ios: {
					blue: '#007AFF',
					cyan: '#5AC8FA',
					orange: '#FF9500',
					pink: '#FF2D92',
					purple: '#AF52DE',
					green: '#34C759',
					red: '#FF3B30',
					yellow: '#FFCC00',
					teal: '#5AC8FA',
					indigo: '#5856D6',
					mint: '#00C7BE',
					brown: '#A2845E'
				},
				// Glassmorphism Colors
				glass: {
					white: 'rgba(255, 255, 255, 0.15)',
					'white-20': 'rgba(255, 255, 255, 0.2)',
					'white-25': 'rgba(255, 255, 255, 0.25)',
					'white-30': 'rgba(255, 255, 255, 0.3)',
					'white-40': 'rgba(255, 255, 255, 0.4)',
					'white-50': 'rgba(255, 255, 255, 0.5)',
					'white-60': 'rgba(255, 255, 255, 0.6)',
					'white-70': 'rgba(255, 255, 255, 0.7)',
					'white-80': 'rgba(255, 255, 255, 0.8)',
					'white-90': 'rgba(255, 255, 255, 0.9)',
					black: 'rgba(0, 0, 0, 0.1)',
					'black-20': 'rgba(0, 0, 0, 0.2)',
					'black-30': 'rgba(0, 0, 0, 0.3)',
					'black-40': 'rgba(0, 0, 0, 0.4)',
					'black-50': 'rgba(0, 0, 0, 0.5)',
					'black-60': 'rgba(0, 0, 0, 0.6)',
					'black-70': 'rgba(0, 0, 0, 0.7)',
					'black-80': 'rgba(0, 0, 0, 0.8)',
					'black-90': 'rgba(0, 0, 0, 0.9)'
				},
				// Aqua Gradient Colors
				aqua: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'3xl': '1.5rem',
				'4xl': '2rem',
				'5xl': '2.5rem'
			},
			backdropBlur: {
				'xs': '2px',
				'sm': '4px',
				'md': '12px',
				'lg': '16px',
				'xl': '24px',
				'2xl': '40px',
				'3xl': '60px'
			},
			boxShadow: {
				'glass': '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
				'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
				'glass-xl': '0 20px 80px rgba(0, 0, 0, 0.15), 0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
				'glow-blue': '0 0 20px rgba(0, 122, 255, 0.3), 0 0 40px rgba(0, 122, 255, 0.1)',
				'glow-purple': '0 0 20px rgba(118, 75, 162, 0.3), 0 0 40px rgba(118, 75, 162, 0.1)',
				'glow-green': '0 0 20px rgba(52, 199, 89, 0.3), 0 0 40px rgba(52, 199, 89, 0.1)',
				'glow-orange': '0 0 20px rgba(255, 149, 0, 0.3), 0 0 40px rgba(255, 149, 0, 0.1)',
				'glow-pink': '0 0 20px rgba(255, 45, 146, 0.3), 0 0 40px rgba(255, 45, 146, 0.1)'
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
				},
				'fadeIn': {
					from: {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slideUp': {
					from: {
						opacity: '0',
						transform: 'translateY(40px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scaleIn': {
					from: {
						opacity: '0',
						transform: 'scale(0.9)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(0, 122, 255, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 30px rgba(0, 122, 255, 0.6)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fadeIn': 'fadeIn 0.6s ease-out',
				'slideUp': 'slideUp 0.6s ease-out',
				'scaleIn': 'scaleIn 0.4s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			},
			fontFamily: {
				'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'sans-serif']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
