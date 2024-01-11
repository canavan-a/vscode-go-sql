const vscode = require('vscode');

const execSelectDecorationType = vscode.window.createTextEditorDecorationType({
    color: '#FFA500',
    isWholeLine: false
});

const testDec = vscode.window.createTextEditorDecorationType({
    color: '#7FFF00',
    isWholeLine: false
});

const removeDec = vscode.window.createTextEditorDecorationType({
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


            function doThing() {
                let keyword = 'FROM'
                const loc = findKeyword(stringAfterExec, keyword)

                if (loc) {
                    let sPos = document.positionAt(matchExecSelect.index + loc + firstIndex)
                    let ePos = document.positionAt(matchExecSelect.index + loc + keyword.length + firstIndex)
                    let kRange = new vscode.Range(sPos, ePos);
                    const kDecoration = {
                        range: kRange,
                        hoverMessage: "sql keyword: " + keyword,
                    }
                    keywordSelected.push(kDecoration)
                    return kRange
                }
                return null
            }

            const r1 = doThing()

            console.log("hello")



            const startPos = document.positionAt(matchExecSelect.index + match.length + 3);
            const endPos = document.positionAt(matchExecSelect.index + firstIndex + stringAfterExec.length - 1);


            const range = new vscode.Range(startPos, endPos);

            if (r1) {
                console.log(range.start)
                console.log("hello")
                console.log(r1.start)


                const newRanges = subtractRanges(range, r1)

                for (let i = 0; i < newRanges.length; i++) {
                    let dec = {
                        range: newRanges[i]
                    }
                    matchesExecSelect.push(dec)
                }

            }
            else {
                const decoration = {
                    range: range,
                    // hoverMessage: 'SQL statement highlighted',
                };

                matchesExecSelect.push(decoration);
            }


            // console.log(newRanges)


        }


        editor.setDecorations(execSelectDecorationType, matchesExecSelect)
        editor.setDecorations(testDec, keywordSelected)

    }

}

function findKeyword(value, keyword) {
    const v = value.indexOf(keyword)
    if (v == -1) {
        return null
    }
    return v
    // note: for keywords you will need to add  these styles first and then put the base over top.
}

function subtractRanges(originalRange, rangeToRemove) {
    const resultRanges = [];

    // Check if the ranges overlap
    if (rangeToRemove.start.isAfterOrEqual(originalRange.start) && rangeToRemove.end.isBeforeOrEqual(originalRange.end)) {
        // Split the original range into two parts, excluding the overlapping section
        if (rangeToRemove.start.isAfter(originalRange.start)) {
            resultRanges.push(new vscode.Range(originalRange.start, rangeToRemove.start));
        }
        if (rangeToRemove.end.isBefore(originalRange.end)) {
            resultRanges.push(new vscode.Range(rangeToRemove.end, originalRange.end));
        }
    } else {
        // No overlap, return the original range
        resultRanges.push(originalRange);
    }

    return resultRanges;
}

module.exports = {
    activate,
    deactivate
};
