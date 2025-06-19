//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  webpack(config) {
    // Find the existing rule handling SVGs and remove it
    config.module.rules = config.module.rules.map(
      (
        /** @type {{ test: { toString: () => string | string[]; }; type: string; }} */ rule
      ) => {
        if (
          rule.test &&
          rule.test.toString().includes('svg') &&
          rule.type === 'asset/resource'
        ) {
          return { ...rule, test: /\.(png|jpe?g|gif|webp|avif)$/i };
        }
        return rule;
      }
    );

    // Add SVGR loader for SVGs
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            // SVGR options here (optional)
            // e.g. icon: true
          },
        },
      ],
    });

    return config;
  },
  nx: {},
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
