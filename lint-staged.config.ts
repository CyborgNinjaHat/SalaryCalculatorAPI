import type { Configuration } from 'lint-staged';

const config: Configuration = {
  '*.ts': ['oxlint --fix', 'oxfmt'],
  '*.{json,jsonc,md,yaml,yml}': 'oxfmt',
};

export default config;
