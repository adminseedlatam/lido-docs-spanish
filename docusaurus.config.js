/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Lido Docs',
  tagline: 'Documentation for the Lido staking protocol',
  url: 'https://adminseedlatam.github.io',
  baseUrl: '/lido-docs-spanish/',
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'throw',
  onBrokenAnchors: 'ignore',
  organizationName: 'adminseedlatam',
  projectName: 'lido-docs-spanish',
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    prism: {
      additionalLanguages: ['solidity'],
    },
    navbar: {
      title: 'Lido Docs',
      logo: {
        alt: 'Lido Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'https://github.com/adminseedlatam/lido-docs-spanish',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/adminseedlatam/lido-docs-spanish/edit/main/',
        },
      },
    ],
  ],
  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      { indexBlog: false, docsRouteBasePath: '/', indexPages: true },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            to: '/guías/lido-tokens-integration-guide',
            from: '/guías/steth-integration-guide',
          },
        ],
      },
    ],
  ],
};
