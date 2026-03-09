export const RTKPlugin = async ({ client }) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") return;

      let cmd = output.args.command;
      if (!cmd) return;

      const originalCmd = cmd;

      if (cmd.startsWith("rtk ") || cmd.includes(" rtk ")) {
        return;
      }

      if (cmd.includes("<<")) {
        return;
      }

      const envPrefixMatch = cmd.match(/^([A-Za-z_][A-Za-z0-9_]*=[^ ]* +)+/);
      const envPrefix = envPrefixMatch ? envPrefixMatch[0] : "";
      const matchCmd = envPrefix ? cmd.slice(envPrefix.length) : cmd;

      let rewritten = "";

      const rewrite = (newCmd) => {
        rewritten = envPrefix + newCmd;
      };

      if (/^git\s+status(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git status/, "rtk git status"));
      } else if (/^git\s+diff(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git diff/, "rtk git diff"));
      } else if (/^git\s+log(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git log/, "rtk git log"));
      } else if (/^git\s+add(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git add/, "rtk git add"));
      } else if (/^git\s+commit(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git commit/, "rtk git commit"));
      } else if (/^git\s+push(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git push/, "rtk git push"));
      } else if (/^git\s+pull(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git pull/, "rtk git pull"));
      } else if (/^git\s+branch(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git branch/, "rtk git branch"));
      } else if (/^git\s+fetch(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git fetch/, "rtk git fetch"));
      } else if (/^git\s+stash(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git stash/, "rtk git stash"));
      } else if (/^git\s+show(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^git show/, "rtk git show"));
      } else if (/^gh\s+(pr|issue|run|api|release)(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^gh /, "rtk gh "));
      } else if (/^cargo\s+test(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^cargo test/, "rtk cargo test"));
      } else if (/^cargo\s+build(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^cargo build/, "rtk cargo build"));
      } else if (/^cargo\s+clippy(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^cargo clippy/, "rtk cargo clippy"));
      } else if (/^cargo\s+check(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^cargo check/, "rtk cargo check"));
      } else if (/^cargo\s+install(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^cargo install/, "rtk cargo install"));
      } else if (/^cargo\s+nextest(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^cargo nextest/, "rtk cargo nextest"));
      } else if (/^cargo\s+fmt(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^cargo fmt/, "rtk cargo fmt"));
      } else if (/^cat\s+/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^cat /, "rtk read "));
      } else if (/^(rg|grep)\s+/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^(rg|grep) /, "rtk grep "));
      } else if (/^ls(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^ls/, "rtk ls"));
      } else if (/^tree(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^tree/, "rtk tree"));
      } else if (/^find\s+/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^find /, "rtk find "));
      } else if (/^diff\s+/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^diff /, "rtk diff "));
      } else if (/^head\s+-[0-9]+\s+/.test(matchCmd)) {
        const lines = matchCmd.match(/^head\s+-(\d+)\s+(.+)$/);
        if (lines) {
          rewritten = `${envPrefix}rtk read ${lines[2]} --max-lines ${lines[1]}`;
        }
      } else if (/^head\s+--lines=\d+\s+/.test(matchCmd)) {
        const lines = matchCmd.match(/^head\s+--lines=(\d+)\s+(.+)$/);
        if (lines) {
          rewritten = `${envPrefix}rtk read ${lines[2]} --max-lines ${lines[1]}`;
        }
      } else if (/^(pnpm\s+)?(npx\s+)?vitest(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^(pnpm )?(npx )?vitest( run)?/, "rtk vitest run"));
      } else if (/^pnpm\s+test(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^pnpm test/, "rtk vitest run"));
      } else if (/^npm\s+test(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^npm test/, "rtk npm test"));
      } else if (/^npm\s+run\s+/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^npm run /, "rtk npm "));
      } else if (/^(npx\s+)?vue-tsc(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^(npx )?vue-tsc/, "rtk tsc"));
      } else if (/^pnpm\s+tsc(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^pnpm tsc/, "rtk tsc"));
      } else if (/^(npx\s+)?tsc(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^(npx )?tsc/, "rtk tsc"));
      } else if (/^pnpm\s+lint(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^pnpm lint/, "rtk lint"));
      } else if (/^(npx\s+)?eslint(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^(npx )?eslint/, "rtk lint"));
      } else if (/^(npx\s+)?prettier(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^(npx )?prettier/, "rtk prettier"));
      } else if (/^(npx\s+)?playwright(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^(npx )?playwright/, "rtk playwright"));
      } else if (/^pnpm\s+playwright(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^pnpm playwright/, "rtk playwright"));
      } else if (/^(npx\s+)?prisma(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^(npx )?prisma/, "rtk prisma"));
      } else if (/^docker\s+compose(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^docker /, "rtk docker "));
      } else if (/^docker\s+(ps|images|logs|run|build|exec)(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^docker /, "rtk docker "));
      } else if (/^kubectl\s+(get|logs|describe|apply)(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^kubectl /, "rtk kubectl "));
      } else if (/^curl\s+/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^curl /, "rtk curl "));
      } else if (/^wget\s+/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^wget /, "rtk wget "));
      } else if (/^pnpm\s+(list|ls|outdated)(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^pnpm /, "rtk pnpm "));
      } else if (/^pytest(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^pytest/, "rtk pytest"));
      } else if (/^python\s+-m\s+pytest(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^python -m pytest/, "rtk pytest"));
      } else if (/^ruff\s+(check|format)(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^ruff /, "rtk ruff "));
      } else if (/^pip\s+(list|outdated|install|show)(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^pip /, "rtk pip "));
      } else if (/^uv\s+pip\s+(list|outdated|install|show)(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^uv pip /, "rtk pip "));
      } else if (/^mypy(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^mypy/, "rtk mypy"));
      } else if (/^python\s+-m\s+mypy(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^python -m mypy/, "rtk mypy"));
      } else if (/^go\s+test(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^go test/, "rtk go test"));
      } else if (/^go\s+build(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^go build/, "rtk go build"));
      } else if (/^go\s+vet(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^go vet/, "rtk go vet"));
      } else if (/^golangci-lint(\s|$)/.test(matchCmd)) {
        rewrite(matchCmd.replace(/^golangci-lint/, "rtk golangci-lint"));
      }

      if (rewritten) {
        output.args.command = rewritten;
      }
    },
  };
};
