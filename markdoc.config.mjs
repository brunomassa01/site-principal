import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    video: {
      render: component('./src/components/VideoEmbed.astro'),
      attributes: {
        src: { type: String, required: true },
        legenda: { type: String },
      },
    },
  },
});
