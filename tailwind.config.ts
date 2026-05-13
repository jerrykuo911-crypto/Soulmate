import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'slide-up': 'slideUp 0.4s ease-out',
        fade: 'fade 0.3s ease-in',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        breathe: 'breathe 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        bob: 'bob 0.35s ease-in-out infinite',
        ripple: 'ripple 1.5s ease-out infinite',
        'talk-photo': 'talk-photo 0.38s ease-in-out infinite',
        blink: 'blink 3.8s ease-in-out infinite',
        'blink-alt': 'blink 4.6s ease-in-out 1.8s infinite',
        'mouth-talk': 'mouth-talk 0.22s ease-in-out infinite',
        'breathe-float': 'breathe-float 4.5s ease-in-out infinite',
        'listening-ring': 'listening-ring 1.5s ease-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'ambient-glow': 'ambient-glow 6s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.4)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '30%': { transform: 'translateY(-3px) rotate(0.4deg)' },
          '70%': { transform: 'translateY(1px) rotate(-0.4deg)' },
        },
        'talk-photo': {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.012)', filter: 'brightness(1.05)' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        blink: {
          '0%, 87%, 100%': { transform: 'scaleY(1)' },
          '91%': { transform: 'scaleY(0.06)' },
          '94%': { transform: 'scaleY(0.06)' },
        },
        'mouth-talk': {
          '0%, 100%': { transform: 'scaleY(0.1)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'breathe-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'listening-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        'ambient-glow': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
