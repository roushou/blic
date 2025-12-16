#!/usr/bin/env bun

import { build, ci, clean, format, info, lint, prompt, test, typecheck } from "./commands";
import { defineCli } from "boune";

const cli = defineCli({
  name: "boune-dev",
  version: "0.1.0",
  description: "Development CLI for the boune monorepo",
  commands: {
    build,
    test,
    lint,
    format,
    typecheck,
    prompt,
    info,
    ci,
    clean,
  },
});

cli.run();
