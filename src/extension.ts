// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposableCallback = vscode.commands.registerCommand(
    "react-utils.useCallbackWrap",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No editor is active");
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      // Match variable assignments that could be wrapped in useCallback.
      // regex pattern to capture 'let' or 'const' in the match.
      const funcPattern = /^\s*(let|const)\s+([a-zA-Z0-9_]+)\s*=/;
      const match = selectedText.match(funcPattern);

      if (match && match[1] && match[2]) {
        // Capture 'let' or 'const', function name
        const declarationType = match[1]; // 'let' or 'const'
        const functionName = match[2];

        // This assumes the whole function, including its declaration, is selected.
        // We're extracting just the function name and will wrap the rest of the selection.
        let restOfFunction = selectedText.substring(match[0].length);

        // Check for and remove a trailing semicolon if present
        restOfFunction = restOfFunction.replace(/;\s*$/, "");

        // Constructing the wrapped function text
        const wrappedText = `${declarationType} ${functionName} = useCallback(${restOfFunction}, []);`;

        editor.edit((editBuilder) => {
          editBuilder.replace(selection, wrappedText);
        });
      } else {
        vscode.window.showWarningMessage(
          "Selected text does not match the expected function format."
        );
      }
    }
  );

  context.subscriptions.push(disposableCallback);

  let disposableMemo = vscode.commands.registerCommand(
    "react-utils.useMemoWrap",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No editor is active");
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      // Match variable assignments that could be wrapped in useMemo.
      // regex pattern to capture 'let' or 'const' in the match.
      const varPattern =
        /^\s*(let|const)\s+([a-zA-Z0-9_]+)\s*=\s*([^;]+);?\s*$/;

      const match = selectedText.match(varPattern);

      if (match && match[1] && match[2] && match[3]) {
        // Capture 'let' or 'const', variable name, and value from the match
        const declarationType = match[1]; // 'let' or 'const'
        const varName = match[2];
        let varValue = match[3].trim();

        // Check for and remove a trailing semicolon if present
        varValue = varValue.replace(/;\s*$/, "");

        // Construct the wrapped variable assignment preserving the original declaration type
        const wrappedText = `${declarationType} ${varName}  = useMemo(() => { return ${varValue} }, []);`;

        editor.edit((editBuilder) => {
          editBuilder.replace(selection, wrappedText);
        });
      } else {
        vscode.window.showWarningMessage(
          "Selected text does not match a simple const variable assignment."
        );
      }
    }
  );

  context.subscriptions.push(disposableMemo);
}
// This method is called when your extension is deactivated
export function deactivate() {}
