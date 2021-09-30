"use strict";

import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {

    console.log("Terminals: " + (<any>vscode.window).terminals.length);

    // tpp compile in terminal
    context.subscriptions.push(vscode.commands.registerCommand('tpp.execInTerminal', execInTerminal));
    // tpp compile in terminal using environment variable file specified in package.json
    context.subscriptions.push(vscode.commands.registerCommand('tpp.execInTerminalWithEnv', execInTerminalEnv));
    // send all ls files to ftp ip specified in package.json
    context.subscriptions.push(vscode.commands.registerCommand('tpp.sendtorobot', () => {
        sendls2ftp(true);
    }));
    // send current file to ftp ip specified in package.json
    context.subscriptions.push(vscode.commands.registerCommand('tpp.sendsingle2robot', () => {
        sendls2ftp(false);
    }));
}

//ref: https://github.com/DonJayamanne/pythonVSCode/commit/97d4fc19624aeb0be67606e95ac705d6b71f6c91 
function execInTerminal() {
    
    console.log("Terminals: " + (<any>vscode.window).terminals.length);

    //retrieve path information about current file
    let filedict:any = currentFilePath();

    //create a terminal window in vscode called "Ext Terminal"
    const terminal = (<any>vscode.window).createTerminal(`Ext Terminal`);

    //settimout for terminal to load before sending text
    setTimeout(() => {
        if (ensureTerminalExists()) {
            //cd into folder
            terminal.sendText(`cd "${filedict.folder}"`);
            //send tpp compile command
            terminal.sendText(`tpp "${filedict.fullPath}" -o "${filedict.lsPath}"`);
            //force show the terminal
            terminal.show();
        }
    }, 1000);

}

function execInTerminalEnv() {
    
    console.log("Terminals: " + (<any>vscode.window).terminals.length);

    //retrieve path information about current file
    let filedict:any = currentFilePath();

    //import filesystem module to read package.json
    const fs = require('fs');
    //import util for promisify functionality
    const util = require('util');

    //use promisfy to read file and put into a promise
    const readFile = util.promisify(fs.readFile);

    //declare asyncronous function to read the json file.
    async function getjson() {
        return await readFile(filedict.folder + '\\package.json', function(err, data) {
            return data ;
        });
    }

    //once promise retrieves json file, parse the json
    // into hash object. Return 'environment' key
    let envPath = getjson().then(data => {
        let envjson = JSON.parse(data);
        return envjson.environment;
    });

    //create a terminal window in vscode called "Ext Terminal"
    const terminal = (<any>vscode.window).createTerminal(`Ext Terminal`);

    //settimout for terminal to load before sending text
    setTimeout(() => {
        if (ensureTerminalExists()) {

            //retrieve the promise storing the 'evironment key
            // in the variable 'envPath'
            envPath.then(function(result){
                //One promise is retrieved run terminal commands
                //cd into folder
                terminal.sendText(`cd "${filedict.folder}"`);
                //send tpp compile command
                terminal.sendText(`tpp "${filedict.fullPath}" -o "${filedict.lsPath}" -e "${result}"`);
                //force show the terminal
                terminal.show();
            });
        }
    }, 1000);

}

function sendls2ftp(sendAll: boolean) {
    //retrieve path information about current file
    let filedict:any = currentFilePath();

    let ftpCmds:string = 'ftpcmds.txt';
    
    //import filesystem module to read package.json
    const fs = require('fs');

    try {
        const jsonText = fs.readFileSync(filedict.folder + '\\package.json', {encoding: 'utf8'});
        const pckg = JSON.parse(jsonText);

        //create run file used for sending commands to ftp
        if (sendAll){
            createftpFile(filedict.folder + '\\ls', ftpCmds, pckg.ftp, pckg.port ?? 21);
        } else {
            createftpFile(filedict.folder + '\\ls', ftpCmds, pckg.ftp, pckg.port ?? 21, filedict.lsName);
        }

        const terminal = (<any>vscode.window).createTerminal(`Ext Terminal`);
        if (ensureTerminalExists()) {
            //cd into folder
            terminal.sendText(`cd "${filedict.folder}\\ls"`);
            //run ftp to robot
            terminal.sendText(`ftp -s:${ftpCmds}`);
            //force show the terminal
            terminal.show();
        }
    } catch (err) {
        console.error(err);
    }
}

//ref: https://github.com/microsoft/vscode-extension-samples/blob/master/terminal-sample/src/extension.ts
function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}

function currentFilePath(){
    //declare dictionary element for filepath information
    //to be retrieved later.
    let filedict:any = {};

    //get active text editor in vscode
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor !== undefined) {
        if (!activeEditor.document.isUntitled) {
            //get full file path of active document
            //must split 'activeEditor' as this may return
            //undefined.
            filedict.fullPath = activeEditor.document.fileName;
            //get just the path where the file resides
            //regex out the file + ext. easier than piping
            //file through filesystem.
            filedict.folder = filedict.fullPath.split(/\\[\w-]+\./)[0];
            //retrieve just the filename and the extension
            filedict.filename = filedict.fullPath.match(/[\w-]+\.+\w+/g)[0];

        } else {
            vscode.window.showErrorMessage('The active file needs to be saved before it can be run');
            return;
        }
    } else {
        vscode.window.showErrorMessage('No open file to run in terminal');
        return;
    }

    const fs = require('fs');

    //create /ls directory for output
    //if it doesn't exist.
    var LSdir = filedict.folder + '\\ls';

    if (!fs.existsSync(LSdir)){
        fs.mkdirSync(LSdir);
    }

    //create file path to store .ls files.
    //store in /ls subdir
    //replace '.tpp' with '.ls'
    filedict.lsName = filedict.filename.replace(/\.[^/.]+$/, ".ls");
    filedict.lsPath = filedict.folder + '\\ls\\' + filedict.lsName;
    

    return filedict;
}

function createftpFile(directory: string, filename: string, host: string, port: number = 21, lsFile:string = ""){
    const fs = require('fs');

    const lineEnd = `\r\n`;
    let text = 
    `open ${host} ${port}${lineEnd}` + 
    `anon${lineEnd}` +
    `bin${lineEnd}` +
    `prompt${lineEnd}`;

    if (lsFile === ""){
        text += `mput *.ls`;
    } else {
        text += `put ${lsFile}`;
    }
    text += `${lineEnd}quit`;
    let path: string = directory + "\\" + filename;

    fs.writeFileSync(path, text, (err) => {  
        if (err) { throw err; }

        console.log("The file was saved!");
    }); 
}