const vscode = require('vscode');

//, "QueryRow", "Query"
const FUNCTION_MATCHES = ['\\.Exec\\(', '\\.Query\\(', '\\.QueryRow\\(', '\\.Prepare\\(', , 'query :=', 'query =']

const SQL_MATCHES = ['FROM', 'SELECT', 'AND', 'VALUES', 'WHERE', 'CONSTRAINT', 'INSERT', 'INTO', 'DELETE', 'UPDATE', 'RETURNING', 'CONFLICT',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ORDER', 'BY', 'JOIN', 'INNER', 'OUTER', 'LEFT', 'RIGHT', 'PARTITION',
    'ON', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'NOT', 'OR', 'BETWEEN', 'LIKE', 'NULL',
    'UNION', 'ALL', 'ANY', 'EXISTS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC', 'AS', 'IN', 'DO', 'IS', 'SET',];


const execSelectDecorationType = vscode.window.createTextEditorDecorationType({
    // color: '#87CEEB',
    isWholeLine: false
});

const testDec = vscode.window.createTextEditorDecorationType({
    color: '#e35117',
    isWholeLine: false
});

const specialDec = vscode.window.createTextEditorDecorationType({
    color: '#facd7f',
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
            doHighlight(FUNCTION_MATCHES)
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

    let matchesExecSelect = []

    let keywordSelected = []

    let specialSelected = []

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i]

        // const regexExecSelect = new RegExp(`\\.${match}\\(\\s*(\`[^\\\`]*\`|"(?:[^"\\\\]|\\\\.)*")`, 'g');
        const regexExecSelect = new RegExp(`${match}\\s*(\`[^\\\`]*\`|"(?:[^"\\\\]|\\\\.)*")`, 'g');

        let matchExecSelect;


        while ((matchExecSelect = regexExecSelect.exec(text)) !== null) {

            const stringAfterExec = matchExecSelect[1];

            let firstIndex = matchExecSelect[0].indexOf("`")
            if (firstIndex == -1) {
                firstIndex = matchExecSelect[0].indexOf(`"`)
            }

            const startPos = document.positionAt(matchExecSelect.index + firstIndex + 1);

            const endPos = document.positionAt(matchExecSelect.index + firstIndex + stringAfterExec.length - 1);
            const range = new vscode.Range(startPos, endPos);

            const preliminaryRanges = []

            preliminaryRanges.push(range)

            function getKeywordRange(keyword) {

                let index = stringAfterExec.indexOf(keyword);
                if (index == -1) {
                    return null
                }
                const occurrences = []
                while (index !== -1) {
                    occurrences.push(index);
                    index = stringAfterExec.indexOf(keyword, index + 1);
                }

                const myRanges = []

                for (let i = 0; i < occurrences.length; i++) {
                    let loc = occurrences[i]
                    if (loc) {
                        let sPos = document.positionAt(matchExecSelect.index + loc + firstIndex)
                        let ePos = document.positionAt(matchExecSelect.index + loc + keyword.length + firstIndex)
                        let kRange = new vscode.Range(sPos, ePos);
                        const kDecoration = {
                            range: kRange,
                            hoverMessage: "sql keyword: " + keyword,
                        }
                        keywordSelected.push(kDecoration)
                        myRanges.push(kRange)
                    }
                }
                return myRanges
            }

            function getSpecialRange(keyword) {

                let index = stringAfterExec.indexOf(keyword);
                if (index == -1) {
                    return null
                }
                const occurrences = []
                while (index !== -1) {
                    occurrences.push(index);
                    index = stringAfterExec.indexOf(keyword, index + 1);
                }

                const myRanges = []

                for (let i = 0; i < occurrences.length; i++) {
                    let loc = occurrences[i]
                    if (loc) {
                        let sPos = document.positionAt(matchExecSelect.index + loc + firstIndex)
                        let ePos = document.positionAt(matchExecSelect.index + loc + keyword.length + firstIndex)
                        let kRange = new vscode.Range(sPos, ePos);
                        const kDecoration = {
                            range: kRange,
                            hoverMessage: "sql param: " + keyword,
                        }
                        specialSelected.push(kDecoration)
                        myRanges.push(kRange)
                    }
                }
                return myRanges
            }

            const keywordList = SQL_MATCHES

            for (let j = 0; j < keywordList.length; j++) {

                const r1 = getKeywordRange(keywordList[j])
                if (r1) {
                    for (let p = 0; p < r1.length; p++) {
                        const depth = preliminaryRanges.length
                        for (let i = 0; i < depth; i++) {
                            // try to remove range from every 
                            if (r1[p]) {
                                const newRanges = subtractRanges(preliminaryRanges[i], r1[p])
                                if (newRanges.length == 1) {
                                    preliminaryRanges[i] = newRanges[0]
                                }
                                else {
                                    preliminaryRanges[i] = newRanges[0]
                                    preliminaryRanges.push(newRanges[1])
                                }

                            }
                        }
                    }
                }
            }

            let counter = 1
            let valid = true
            while (valid) {

                valueString = `$${counter}`

                const r1 = getSpecialRange(valueString)
                if (r1) {
                    for (let p = 0; p < r1.length; p++) {
                        const depth = preliminaryRanges.length
                        for (let i = 0; i < depth; i++) {
                            // try to remove range from every 
                            if (r1[p]) {
                                const newRanges = subtractRanges(preliminaryRanges[i], r1[p])
                                if (newRanges.length == 1) {
                                    preliminaryRanges[i] = newRanges[0]
                                }
                                else {
                                    preliminaryRanges[i] = newRanges[0]
                                    preliminaryRanges.push(newRanges[1])
                                }

                            }
                        }
                    }
                }
                else {
                    valid = false
                }
                counter += 1
            }




            for (let i = 0; i < preliminaryRanges.length; i++) {
                let dec = {
                    range: preliminaryRanges[i]
                }
                matchesExecSelect.push(dec)
            }

        }

        editor.setDecorations(execSelectDecorationType, matchesExecSelect)

        editor.setDecorations(testDec, keywordSelected)

        editor.setDecorations(specialDec, specialSelected)

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
