import { validateRegistry } from '../src/core/validator.js';

async function main() {
  const errors = await validateRegistry();
  if (errors.length > 0) {
    console.error(`✗ Registry validation failed with ${errors.length} error(s):`);
    for (const err of errors) {
      console.error(`  ${err.file}: ${err.message}`);
    }
    process.exit(1);
  }
  console.log('✓ Registry validation passed');
}

main();
