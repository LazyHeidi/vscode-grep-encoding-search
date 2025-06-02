import * as vscode from 'vscode';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'grepEncodingSearch.setSearchEncoding',
    async () => {
      const config = vscode.workspace.getConfiguration('grepEncodingSearch');
      const encoding = await vscode.window.showInputBox({
        placeHolder: 'e.g. Shift_JIS, EUC-JP, UTF-8',
        prompt: 'Enter encoding for search',
        value: config.get<string>('defaultEncoding', 'UTF-8'),
      });

      if (encoding) {
        await config.update('defaultEncoding', encoding, vscode.ConfigurationTarget.Workspace);
        vscode.window.showInformationMessage(`Search encoding set to ${encoding}`);
      }
    }
  );

  context.subscriptions.push(disposable);

  const provider: vscode.TextSearchProvider = {
    async provideTextSearchResults(query, options, progress, token) {
      const config = vscode.workspace.getConfiguration('grepEncodingSearch');
      const encoding = config.get<string>('defaultEncoding', 'UTF-8');
      const maxSize = options.maxFileSize || 1024 * 1024 * 2; // 2MB default

      const includes = options.includes?.length
        ? options.includes.join(',')
        : '**/*';
      const excludes = options.excludes?.join(',') ?? '';
      const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(options.folder, includes),
        excludes
      );

      for (const uri of files) {
        if (token.isCancellationRequested) {
          break;
        }
        try {
          const stat = await vscode.workspace.fs.stat(uri);
          if (stat.size > maxSize) {
            continue; // skip large files
          }
          const buffer = await vscode.workspace.fs.readFile(uri);
          if (isBinary(buffer)) {
            continue; // skip binary
          }
          const text = iconv.decode(Buffer.from(buffer), encoding);
          searchInText(uri, text, query, progress);
        } catch (err) {
          // ignore errors per file
        }
      }

      return { limitHit: false };
    },
  };

  context.subscriptions.push(
    vscode.workspace.registerTextSearchProvider('file', provider)
  );
}

export function deactivate() {}

function searchInText(
  uri: vscode.Uri,
  text: string,
  query: vscode.TextSearchQuery,
  progress: vscode.Progress<vscode.TextSearchResult>
) {
  const lines = text.split(/\r?\n/);
  const pattern = query.isRegExp
    ? new RegExp(query.pattern, query.isCaseSensitive ? 'g' : 'gi')
    : new RegExp(escapeRegExp(query.pattern), query.isCaseSensitive ? 'g' : 'gi');

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber];
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line))) {
      const range = new vscode.Range(
        lineNumber,
        match.index,
        lineNumber,
        match.index + match[0].length
      );
      progress.report({
        uri,
        ranges: range,
        preview: { text: line, matches: range },
      });
    }
  }
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function isBinary(buffer: Uint8Array): boolean {
  const len = Math.min(buffer.length, 1000);
  for (let i = 0; i < len; i++) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}
