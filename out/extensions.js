const vscode = require('vscode');

function activate(context) {
    // Other activation logic

    // Activate theme when a Go file is opened
    vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === 'go') {
            vscode.workspace.getConfiguration().update('workbench.colorTheme', 'SQL Theme');
        }
    });
}

module.exports = {
    activate
};
