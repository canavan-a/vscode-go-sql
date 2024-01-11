const vscode = require('vscode');

const execSelectDecorationType = vscode.window.createTextEditorDecorationType({
    color: '#FFA500',
    isWholeLine: false
});

const testDec = vscode.window.createTextEditorDecorationType({
    color: '#DA70D6',
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
            doHighlight(["Exec", "QueryRow", "Query"])
        } else {
            // Clear decorations if the document is not a Go file
            editor.setDecorations(execSelectDecorationType, []);
        }
    }
}

function doHighlight(matches) {
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const text = document.getText();

    let matchesExecSelect = [];

    let keywordSelected = []

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i]

        const regexExecSelect = new RegExp(`\\.${match}\\(\\s*(\`[^\\\`]*\`|"(?:[^"\\\\]|\\\\.)*")`, 'g');

        let matchExecSelect;

        while ((matchExecSelect = regexExecSelect.exec(text)) !== null) {
            const stringAfterExec = matchExecSelect[1];

            let firstIndex = matchExecSelect[0].indexOf("`")
            if (firstIndex == -1) {
                firstIndex = matchExecSelect[0].indexOf(`"`)
            }



            const startPos = document.positionAt(matchExecSelect.index + match.length + 3);
            const endPos = document.positionAt(matchExecSelect.index + firstIndex + stringAfterExec.length - 1);


            const range = new vscode.Range(startPos, endPos);

            const decoration = {
                range: range,
                id: "x",
                hoverMessage: 'SQL statement highlighted',
            };

            matchesExecSelect.push(decoration);
        }
        editor.setDecorations(execSelectDecorationType, matchesExecSelect)
        // const r = new vscode.Range(document.positionAt(0), document.positionAt(2000))
        // editor.setDecorations(testDec, [{
        //     range: r,
        //     id: "x",
        //     hoverMessage: 'SQL statement highlighted',
        // },]);

    }

}

function findKeyword(str, keyword) {
    // note: for keywords you will need to add  these styles first and then put the base over top.
}


module.exports = {
    activate,
    deactivate
};
