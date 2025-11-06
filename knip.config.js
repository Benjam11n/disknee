/** @type {import('knip').KnipConfig} */
export default {
  entry: ['app/**/*.{ts,tsx}'],
  project: ['**/*.{ts,tsx}'],
  ignoreDependencies: [],
  ignore: [
    // Ignore Next.js special files
    'app/**/layout.tsx',
    'app/**/page.tsx',
    'app/**/loading.tsx',
    'app/**/error.tsx',
    'app/api/**/*.ts',

    'components/ui/**/*.{ts,tsx}',
  ],
};
