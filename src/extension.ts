import * as vscode from 'vscode';

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
}

export function deactivate() {}
