## [cli-v0.9.0] - 2025-12-17

### 🚀 Features

- Use shared stdin in prompts
- Add `create-boune` package
- *(prompt)* Add interactive arrow keys and j/k navigation to select prompts
- Add release script
- Use `boune` for release script
- Add progress bar component
- Add validation
- Add command suggestion
- Add shell completions for bash, zsh and fish
- Use TypeScript template literal types to extract argument/option types
- [**breaking**] Redesign argument/option API with object-based configuration
- [**breaking**] Merge `flag` and `option`
- [**breaking**] Make `required` field mandatory for arguments
- Add autocomplete, number and filepath prompts
- Setup documentation website with landing page
- Add `testing` partial support
- *(docs)* Migrate to `Astro` and write documentation
- *(create)* Preprocess args to support `bun create boune`
- *(types)* Add branded types for ParsedArgs/ParsedOptions
- [**breaking**] Replace builder pattern of args and options with plain objects
- *(cli)* Add monorepo development CLI
- Add cli app
- *(prompts)* Add `date` prompt
- *(prompts)* Add `form` prompt
- Add documentation generation
- Add devtools
- *(types)* Add choices field with compile-time type narrowing

### 🐛 Bug Fixes

- Explicit return types to all factory functions
- *(create)* Bump `boune` dependency to `0.5.0`
- Use `Bun.Glob` instead of importing from "bun" for JSR compatibility
- *(prompt)* Replace `process.exit` with `PromptCancelledError`

### 🚜 Refactor

- Run project creation directly without subcommand
- Simplify type inference with `const` type parameter
- Simplify and consolidate types
- Use correct `boune` API for release.ts
- *(release)* Improve release script structure and usage
- *(boune)* [**breaking**] Replace fluent API with declarative schema pattern
- Update release script, documentation and comments
- *(boune)* Replace imperative parsing with declarative patterns
- *(boune)* Reorganize source files into domain-based structure
- *(docs)* Use Tailwind @theme for neon colors
- *(create)* Use `boune` for CLI
- *(validation)* Consolidate validators with declarative rule specs
- *(validation)* Split validator.ts into modular file structure
- *(prompt)* Declarative schema-based prompt architecture
- *(output)* Split format.ts
- *(create-boune)* Declarative API and auto-sync `boune` version

### 📚 Documentation

- Add `README` to `boune` package
- Update documentation
- Add documentation link to Hero section

### ⚙️ Miscellaneous Tasks

- Add Github action
- Rename repo to `boune`
- Add LICENSE to `boune` package
- Add explicit return type to colors
- Add `Spinner` interface
- Bump `boune` version
- Release
- Add `ValidatorFactory` type
- Bump versions
- Setup `oxlint` and fix lint errors
- Release
- Bump versions
- Add `clean` script
- Update examples
- Minor bumps
- Remove unnecessary comments
- Bump versions
- *(docs)* Setup biome with format and lint scripts
- Release `v0.9.0` and add changelog
