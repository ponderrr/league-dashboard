/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.sleeper.app',
      },
    ],
  },
  // Increase API route timeout for long-running sync operations
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Three.js and React Three Fiber support
  // CRITICAL: Must transpile R3F's react-reconciler to prevent React internals access errors
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'react-reconciler'],
  webpack: (config, { isServer }) => {
    // Exclude canvas from server-side bundle to avoid issues in Node environment
    if (isServer) {
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }
    
    // CRITICAL FIX: Force all React imports to resolve to the EXACT same instance
    // This prevents "Cannot read properties of undefined (reading 'ReactCurrentOwner')" errors
    // The issue is that R3F's react-reconciler needs to access React internals from the SAME React instance
    if (!isServer) {
      const reactPath = require.resolve('react');
      const reactDomPath = require.resolve('react-dom');
      
      // Force ALL React imports (including from node_modules) to use the same instance
      // CRITICAL: Only alias with $ to preserve subpath exports like 'react/jsx-runtime'
      config.resolve.alias = {
        ...config.resolve.alias,
        // Match exact package names only (preserves 'react/jsx-runtime' etc)
        'react$': reactPath,
        'react-dom$': reactDomPath,
      };
      
      // CRITICAL: Ensure React is NEVER externalized (it must be bundled)
      // This ensures R3F's reconciler can access React internals
      if (Array.isArray(config.externals)) {
        config.externals = config.externals.filter(
          (external) => 
            typeof external !== 'object' || 
            (!external.react && !external['react-dom'])
        );
      }
      
      // CRITICAL: Keep React and R3F in the main bundle (don't split them)
      // This ensures R3F's reconciler can access React internals directly
      // The issue is that when React is in a separate chunk, its internals aren't accessible
      const originalSplitChunks = config.optimization?.splitChunks || {};
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...originalSplitChunks,
          cacheGroups: {
            ...originalSplitChunks.cacheGroups,
            // CRITICAL: Exclude React/R3F from ALL splitting - they must stay in main bundle
            default: {
              ...originalSplitChunks.cacheGroups?.default,
              test: (module) => {
                // Don't split React or R3F packages
                const request = module.resource || module.userRequest || '';
                return !/[\\/]node_modules[\\/](react|react-dom|@react-three|react-reconciler)[\\/]/.test(request);
              },
            },
            // Vendor chunks should NOT include React/R3F
            vendor: {
              ...originalSplitChunks.cacheGroups?.vendor,
              test: (module) => {
                const request = module.resource || module.userRequest || '';
                // Only split non-React/R3F vendor code
                return /[\\/]node_modules[\\/]/.test(request) && 
                       !/[\\/]node_modules[\\/](react|react-dom|@react-three|react-reconciler)[\\/]/.test(request);
              },
            },
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;

