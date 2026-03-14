import type { Preview } from '@storybook/react'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'genome-dark',
      values: [
        { name: 'genome-dark', value: '#0A0A0F' },
        { name: 'genome-card', value: '#12121A' },
        { name: 'white',       value: '#ffffff' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },
    layout: 'centered',
  },
}

export default preview
