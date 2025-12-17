export type ArgumentInfo = {
  name: string;
  description: string;
  type: string;
  required: boolean;
  default?: unknown;
  variadic?: boolean;
};

export type OptionInfo = {
  name: string;
  short?: string;
  description: string;
  type: string;
  required: boolean;
  default?: unknown;
  env?: string;
};

export type CommandInfo = {
  name: string;
  description: string;
  aliases: string[];
  arguments: ArgumentInfo[];
  options: OptionInfo[];
  subcommands: CommandInfo[];
  hidden: boolean;
};

export type CliInfo = {
  name: string;
  version: string;
  description: string;
  commands: CommandInfo[];
  globalOptions: OptionInfo[];
};

export type ServeDocsOptions = {
  port?: number;
  open?: boolean;
};
