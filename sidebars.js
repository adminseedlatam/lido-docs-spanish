module.exports = {
  docs: [
    'introduction',
    'lido-dao',
    'guías/lido-tokens-integration-guide',
    {
      type: 'category',
      label: 'Guías',
      items: [
        {
          type: 'category',
          label: 'Node Operators',
          items: [
            'guías/node-operators/general-overview',
            'guías/node-operators/validator-keys',
            'guías/node-operators/el-rewards-configuration',
            {
              type: 'category',
              label: 'Validator Exits Automation',
              items: [
                'guías/node-operators/exits/introduction',
                'guías/node-operators/exits/general-information',
                'guías/node-operators/exits/exit-message-generation-signing',
                'guías/node-operators/exits/flow-examples',
                'guías/node-operators/exits/tooling-setup',
              ],
            },
          ],
        },
        'guías/oracle-operator-manual',
        {
          type: 'category',
          label: 'Oracle specification',
          items: [
            'guías/oracle-spec/accounting-oracle',
            'guías/oracle-spec/validator-exit-bus',
            'guías/oracle-spec/penalties',
          ],
        },
        'guías/deposit-security-manual',
        {
          type: 'category',
          label: 'Tooling',
          items: [
            'guías/tooling',
            'guías/validator-ejector-guide',
            'guías/kapi-guide',
          ],
        },
        'guías/multisig-deployment',
        'guías/protocol-levers',
        'guías/etherscan-voting',
        'guías/easy-track-guide',
        'guías/address-ownership-guide',
        'guías/multisig-signer-manual',
        'guías/checking-aragon-vote',
        'guías/checking-gnosis-safe',
        'guías/1inch-pool-rewards',
        'guías/early-staker-airdrop',
        'guías/jumpgates',
        'guías/verify-lido-v2-upgrade-manual'
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/api',
        'integrations/wallets',
        'integrations/sdk',
        'integrations/subgraph',
        {
          type: 'category',
          label: 'AAVE',
          items: ['integrations/aave/specification', 'integrations/aave/aip'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Token guides',
      items: [
        'token-guides/steth-superuser-functions',
        'token-guides/steth-on-aave-caveats',
        'token-guides/wsteth-bridging-guide',
      ],
    },
    {
      type: 'category',
      label: 'Contracts',
      items: [
        'contracts/lido-locator',
        'contracts/lido',
        'contracts/eip712-steth',
        'contracts/accounting-oracle',
        'contracts/validators-exit-bus-oracle',
        'contracts/hash-consensus',
        'contracts/legacy-oracle',
        'contracts/oracle-report-sanity-checker',
        'contracts/oracle-daemon-config',
        'contracts/staking-router',
        'contracts/node-operators-registry',
        'contracts/withdrawal-queue-erc721',
        'contracts/withdrawal-vault',
        'contracts/wsteth',
        'contracts/deposit-security-module',
        'contracts/burner',
        'contracts/lido-execution-layer-rewards-vault',
        'contracts/mev-boost-relays-allowed-list',
        'contracts/trp-vesting-escrow',
        'contracts/gate-seal',
        'contracts/insurance',
        'contracts/ossifiable-proxy'
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: ['security/bugbounty'],
    },
    {
      type: 'category',
      label: 'Deployed contracts',
      link: { type: 'doc', id: 'deployed-contracts/index' },
      items: [
        { type: 'doc', id: 'deployed-contracts/index', label: 'Mainnet' },
        'deployed-contracts/holesky',
        'deployed-contracts/sepolia'
      ],
    },
    {
      type: 'category',
      label: 'Multisigs',
      items: [
        'multisigs/emergency-brakes',
        'multisigs/committees',
        'multisigs/lido-on-x',
        'multisigs/lido-contributors-group',
        'multisigs/other',
      ],
    },
    {
      type: 'category',
      label: 'IPFS',
      items: [
        'ipfs/about',
        'ipfs/release-flow',
        'ipfs/security',
        'ipfs/hash-verification',
        'ipfs/apps-list'
      ],
    },
    {
      type: 'category',
      label: 'Staking Modules',
      items: [
        {
          type: 'category',
          label: 'CSM',
          items: [
            'staking-modules/csm/intro',
            'staking-modules/csm/join-csm',
            'staking-modules/csm/rewards',
            'staking-modules/csm/penalties',
            'staking-modules/csm/validator-exits',
            'staking-modules/csm/further-reading',
          ],
        },
      ],
    },
  ],
}
