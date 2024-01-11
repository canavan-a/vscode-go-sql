const vscode = require('vscode');

// Move the decoration type outside the activate function so that it is accessible globally
const httpDecorationType = vscode.window.createTextEditorDecorationType({
    // backgroundColor: 'red',
    color: 'greenyellow',
    isWholeLine: false  // Set this to false to only highlight the matched text
});

const execSelectDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'lightblue',
    color: 'green',
    isWholeLine: false
});

function activate(context) {
    // Register the onDidChangeTextDocument event
    let changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        // Check if the change is in an active text editor
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            // Trigger your function to update here
            highlightExecSelect();
        }
    });

    // Register the onDidChangeActiveTextEditor event
    let editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
        // Trigger your function to update when the active text editor changes
        highlightExecSelect();
    });

    // Add the event listeners to the subscriptions to ensure they're cleaned up when the extension is deactivated
    context.subscriptions.push(changeDisposable, editorChangeDisposable);

    // Initial highlighting when the extension is activated
    highlightExecSelect();
}

function deactivate() { }

function highlightExecSelect() {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const document = editor.document;

        // Check if the document language is Go
        if (document.languageId === 'go') {
            // Get the entire content of the editor
            const text = document.getText();

            // Define a regular expression to match ".Exec(" and the string that follows
            const regexExecSelect = /\.Exec\((`[^`]*`|"(?:[^"\\]|\\.)*")/g;

            // Find all matches in the text for ".Exec(" and the following string
            let matchesExecSelect = [];
            let matchExecSelect;
            while ((matchExecSelect = regexExecSelect.exec(text)) !== null) {
                // Extract the string content after .Exec(
                const stringAfterExec = matchExecSelect[1];

                // Calculate the start and end positions for the entire string after .Exec(
                const startPos = document.positionAt(matchExecSelect.index + 7); // 7 is the length of ".Exec("
                const endPos = document.positionAt(matchExecSelect.index + stringAfterExec.length + 5); // Adjust end position

                // Create a range for the entire string after .Exec(
                const range = new vscode.Range(startPos, endPos);

                // Apply the light blue background color style to the entire string after .Exec(
                const decoration = {
                    range: range,
                    hoverMessage: 'Highlighted string after .Exec(',
                    backgroundColor: 'lightblue'
                };

                // Accumulate the decorations for the string after .Exec(
                matchesExecSelect.push(decoration);
            }

            // Clear existing decorations before adding new ones
            editor.setDecorations(execSelectDecorationType, []);

            // Add all the decorations to the editor for the string after .Exec(
            editor.setDecorations(execSelectDecorationType, matchesExecSelect);
        } else {
            // Clear decorations if the document is not a Go file
            editor.setDecorations(execSelectDecorationType, []);
        }
    }
}


module.exports = {
    activate,
    deactivate
};
