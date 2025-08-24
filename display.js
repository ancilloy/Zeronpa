let global = {};

// ---------- Basenames definition ---------- //
global.basenames = {
    "zero"    : "Zero III",
    "oldAkane": "Akane",
    "none"    : ""
};
// ------------------------------------------ //









function papaParseAsync(url, options) {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            ...options,
            complete: results => resolve(results),
            error: err => reject(err)
        });
    });
}

global.musicNames = {};
papaParseAsync(`https://ancilloy.github.io/Zeronpa/musics/musicnames.csv`, { download: true, delimiter: ",", header: true, skipEmptyLines: true, step: res => {
    if (res.data == null) {
        console.log("----- Error ! Unreadable line in musicnames.csv :");
        console.log(res);
    } else {
        let line = res.data;
        if (line.id!="======") {
            global.musicNames[line.id] = line.name;
        }
    }
} });

global.musicNameInterval = null;

global.musicPlayer = document.getElementById("musicPlayer");
global.musicPlayer.volume = document.getElementById("volumeBar").value / 100;

global.visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            musicChange(entry.target.music);
            global.visibilityObserver.unobserve(entry.target);
        }
    })
}, {
    threshold: 1
});

function mute() {
    if (global.musicPlayer.muted) {
        global.musicPlayer.muted = false;
        document.getElementById("muteButton").innerHTML = 'volume_up';
    } else {
        global.musicPlayer.muted = true;
        document.getElementById("muteButton").innerHTML = 'volume_off';
    }
}

function pause() {
    if (global.musicPlayer.paused) {
        global.musicPlayer.play();
    } else {
        global.musicPlayer.pause();
    }
    updatePauseButton();
}

function updatePauseButton() {
    if (global.musicPlayer.paused) {
        document.getElementById("pauseButton").innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
    } else {
        document.getElementById("pauseButton").innerHTML = '<span class="material-symbols-outlined">pause</span>';
    }
}

function musicChange(name) {
    global.musicPlayer.src = `musics/${name}.mp3`;
    global.musicPlayer.play();
    updatePauseButton();

    if (global.musicNameInterval!=null) {
        clearInterval(global.musicNameInterval);
    }
    if (global.musicNames[name]!=null) {
        document.getElementById("trackInfo").innerHTML = `Current track : ${global.musicNames[name]}`;
    } else {
        global.musicNameInterval = setInterval(() => {
            if (global.musicNames[name]!=null) {
                document.getElementById("trackInfo").innerHTML = `Current track : ${global.musicNames[name]}`;
                clearInterval(global.musicNameInterval);
            }
        }, 1000);
    }
}

function volumeChange(ev) {
    global.musicPlayer.volume = this.value / 100;
}
document.getElementById("volumeBar").addEventListener("change", volumeChange);








// =======================================
// ========== Reading dialogues ==========
// =======================================

function capitalize(mot) {
    return mot.charAt(0).toUpperCase() + mot.slice(1);
}

global.mainSection = document.getElementById("mainSection");
global.dialoguesBank = {};

async function readScriptName(scriptName) {
    await readScriptPath(`https://ancilloy.github.io/Zeronpa/scripts/${scriptName}.csv`);
}

async function readScriptPath(scriptPath) {
    let state = {
        readingDialogue: false,
        music: null,
        currentTab: null,
        dialogueName: null
    };

    await papaParseAsync(scriptPath, { download: true, delimiter: ",", header: true, skipEmptyLines: true, step: res => {
        if (res.data == null) {
            console.log("----- Error ! Unreadable line :");
            console.log(res);
        } else {
            let line = res.data;
            if (line.character=="cmd") { // First column : if cmd, indicated it is a special command.
                switch(line.portrait) { // Second column : command name
                    case "decor":
                        let decorName = line.text; // Third column : command argument (here, name of the decor to display)
                        let decor = document.createElement("div");
                        decor.className = "decor";
                        decor.innerHTML = `<img src="https://ancilloy.github.io/Zeronpa/decors/${decorName}.png">`;
                        global.mainSection.appendChild(decor);
                        break;
                    case "beginDialogue":
                        state.currentTab = document.createElement("table");
                        state.currentTab.className = "content";
                        state.dialogueName = line.text; // Third column : command argument (here, name of the dialogue)
                        state.readingDialogue = true;
                        break;
                    case "endDialogue":
                        state.readingDialogue = false;
                        if (state.dialogueName=="") { // If dialogueName is empty, the dialogue is immediately displayed.
                            global.mainSection.appendChild(state.currentTab);
                        } else { // Else, it is stored in the bank, to be displayed later.
                            global.dialoguesBank[state.dialogueName] = state.currentTab;
                        }
                        state.currentTab = null;
                        state.dialogueName = null;
                        break;
                    case "music":
                        state.music = line.text; // Third column : command argument (here, name of the dialogue)
                        break;
                    case "renameChar":
                        let renameSplit = line.text.split('|'); // Third column : command argument (here, name of the character and their new display name, separated by a |)
                        global.basenames[renameSplit[0]] = renameSplit[1];
                        break;
                    case "nextPart":
                        linkNextPart(line.text); // Third column : command argument (here, link to the next part)
                        break;
                    default: // Unknown command.
                        console.log(`----- Error ! Unrecognized command ${line.portrait} :`);
                        console.log(line);
                        break;
                }
            } else {
                if (state.readingDialogue) {
                    let tabLine = readDialogueLine(line);
                    state.currentTab.appendChild(tabLine);

                    if (state.music!=null) {
                        tabLine.music = state.music;
                        global.visibilityObserver.observe(tabLine);
                        state.music = null;
                    }
                } else {
                    console.log("----- Error ! Unrecognized out of context line :");
                    console.log(line);
                }
            }
        }
    } });
}

function readDialogueLine(line) {
    let tabLine = document.createElement("tr");

    // If a character has a special name for that line, it will be displayed.
    // If not, their base name will be displayed. For most characters, it is just their name in-code but with a capital.
    // Some other characters have special base names, listed at the beginning of this file (example : zero -> Zero III)
    let name = global.basenames[line.character]!=null ? global.basenames[line.character] : capitalize(line.character);

    let portrait = (line.portrait!="") ? line.portrait : "stand"; // stand.png is the default portrait for each character.
    let imgPath = (portrait=="none") ? "https://ancilloy.github.io/Zeronpa/portraits/none/stand.png" : `https://ancilloy.github.io/Zeronpa/portraits/${line.character}/${portrait}.png`;

    let portraitCell = document.createElement("td");
    portraitCell.className = "portrait";
    portraitCell.innerHTML = `<img src="${imgPath}"><p>${name}</p>`;
    tabLine.appendChild(portraitCell);

    let textCell = document.createElement("td");
    textCell.className = "text";
    let parsed = parseColors(line.text)
    textCell.innerHTML = parsed.text;
    tabLine.appendChild(textCell);

    return tabLine;
}

function parseColors(text) {
    let ret = {
        text: "",
        weakPoints: [],
        agreePoints: []
    }

    let split1 = text.split("`");
    let text1 = split1[0];
    for (let i=2; i<split1.length; i+=2) {
        text1 += `<span class="narration">${split1[i-1]}</span>${split1[i]}`;

    }

    let split2 = text1.split("|");
    let text2 = split2[0];
    for (let i=2; i<split2.length; i+=2) {
        text2 += `<span class="agree">${split2[i-1]}</span>${split2[i]}`;
        ret.agreePoints.push(split2[i-1]);
    }

    let split3 = text2.split("*");
    let text3 = split3[0];
    for (let i=2; i<split3.length; i+=2) {
        text3 += `<span class="weak">${split3[i-1]}</span>${split3[i]}`;
        ret.weakPoints.push(split3[i-1]);
    }

    ret.text = text3;
    return ret;
}

function linkNextPart(link) {
    let next = document.createElement("a");
    next.innerHTML = "<button>Next part</button>";
    next.href = link;
    global.mainSection.appendChild(next);
}







// ==================================
// ========== Escape rooms ==========
// ==================================

function escapeRoomCommands(index, tutorial=false) {
    let tRow = document.createElement("tr");
    tRow.id = `commandsRow-${index}`;

    let commands = document.createElement("td");
    commands.className = "commands";
    commands.colSpan = 2;

    if (tutorial) {
        let tutorialBlock = document.createElement("p");
        tutorialBlock.id = "spoilerBlock-1";
        tutorialBlock.className = "spoilerBlock spoilerHidden";
        tutorialBlock.innerHTML = `<p>Welcome. If this is your first time, you might be a little confused, right ? Don't worry, it's really simple. This is an escape room : you are locked inside this room, and must find a way out.</p>` +
            `<p>The first line of the interface allows you explore a specific area of the room you have access to. Just select where you want to explore, then validate. You can inspect an area several times, which might lead to additonnal dialogue, but only once inspection is enough to advance. Once an area has no more dialogue to yield through inspecting, it will be grayed out in the list.</p>` +
            `<p>The second line allows you to use specific objects on specific areas of the room. It won't be possible if you have no object, so inspect around to find some. Your actions can influence the room, by altering some areas, or revealing new ones.</p>` +
            `<p>Huh ? What did you say ? You're not interested in escape rooms, and would rather progress the story ? But... I've worked hard on it... *sigh* No, I understand. The only escape room Danganronpa ever had was optional, after all. If you want to skip this escape room, just click <a class="weak" href="${global.allItems["exit"].name}">this link</a>. Any story-relevant detail mentioned in the room will be mentioned again in the story section.</p>` +
            `<div id="spoilerHeader-1" class="spoilerHeader prevent-select" onclick="spoil(1);">Show tutorial</div>`;

        commands.appendChild(tutorialBlock);
    }

    let areaInspector = document.createElement("div");
    areaInspector.className = "col3";

    let areaInspectorLabel = document.createElement("span");
    areaInspectorLabel.className = "label";
    areaInspectorLabel.innerHTML = "Inspect an area";
    areaInspector.appendChild(areaInspectorLabel);

    let areaInspectorPart1 = document.createElement("div");
    let areaInspectSelector = newSelector(global.areasList, global.allAreas, true);
    areaInspectSelector.id = `areaInspectSelector-${index}`;
    areaInspectorPart1.appendChild(areaInspectSelector);
    areaInspector.appendChild(areaInspectorPart1);

    let areaInspectorPart2 = document.createElement("div");
    areaInspector.appendChild(areaInspectorPart2);

    let areaInspectorPart3 = document.createElement("div");
    areaInspectorPart3.innerHTML = `<button id="inspectButton-${index}" onClick="inspectArea(${index});">Inspect</button>`
    areaInspector.appendChild(areaInspectorPart3);

    commands.appendChild(areaInspector);



    let areaInteractor = document.createElement("div");
    areaInteractor.className = "col3";

    let areaInteractorLabel = document.createElement("span");
    areaInteractorLabel.className = "label";
    areaInteractorLabel.innerHTML = "Use an item somewhere";
    areaInteractor.appendChild(areaInteractorLabel);

    let noItems = global.itemsList.length==0;

    let areaInteractorPart1 = document.createElement("div");
    let areaInteractSelector = newSelector(global.areasList, global.allAreas);
    areaInteractSelector.id = `areaInteractSelector-${index}`;
    if (noItems) { areaInteractSelector.disabled = true; }
    areaInteractorPart1.appendChild(areaInteractSelector);
    areaInteractor.appendChild(areaInteractorPart1);

    let areaInteractorPart2 = document.createElement("div");
    let itemInteractSelector = newSelector(global.itemsList, global.allItems);
    itemInteractSelector.id = `itemInteractSelector-${index}`;
    if (noItems) { itemInteractSelector.disabled = true; }
    areaInteractorPart2.appendChild(itemInteractSelector);
    areaInteractor.appendChild(areaInteractorPart2);

    let areaInteractorPart3 = document.createElement("div");
    areaInteractorPart3.innerHTML = `<button id="interactButton-${index}" onClick="interactArea(${index});"${noItems ? " disabled=true" : ""}>Use item</button>`
    areaInteractor.appendChild(areaInteractorPart3);


    commands.appendChild(areaInteractor);



    let resultDisplayDiv = document.createElement("div");

    let resultDisplay = document.createElement("span");
    resultDisplay.id = `resultDisplay-${index}`;
    resultDisplay.className = "empty";
    resultDisplay.innerHTML = ".";
    resultDisplayDiv.appendChild(resultDisplay);

    let resultDisplayLabel = document.createElement("span");
    resultDisplayLabel.className = "label";
    resultDisplayLabel.innerHTML = "Result";
    resultDisplayDiv.appendChild(resultDisplayLabel);

    commands.appendChild(resultDisplayDiv);

    tRow.appendChild(commands)
    return tRow;
}

function newSelector(collection, database, inspect=false) {
    let selector = document.createElement("select");

    for(let i=0; i<collection.length; i++) {
        let op = document.createElement("option");
        op.innerHTML = database[collection[i]].name;
        op.value = database[collection[i]].id;
        if (inspect && global.inspectedAreas[collection[i]]!= null && global.inspectedAreas[collection[i]].status=="end") {
            op.className = "inspected";
        }
        selector.appendChild(op);
    }

    return selector;
}



async function setupEscapeRoom(name) {
    global.allItems = {};
    await papaParseAsync(`https://ancilloy.github.io/Zeronpa/scripts/escapeRooms/${name}/items.csv`, { download: true, delimiter: ",", header: true, skipEmptyLines: true, step: async res => {
        if (res.data == null) {
            console.log(`----- Error ! Unreadable line in https://ancilloy.github.io/Zeronpa/scripts/escapeRooms/${name}/items.csv :`);
            console.log(res);
        } else {
            global.allItems[res.data.id] = res.data;
        }
    }});

    global.allAreas = {};
    await papaParseAsync(`https://ancilloy.github.io/Zeronpa/scripts/escapeRooms/${name}/areas.csv`, { download: true, delimiter: ",", header: true, skipEmptyLines: true, step: res => {
        if (res.data == null) {
            console.log(`----- Error ! Unreadable line in https://ancilloy.github.io/Zeronpa/scripts/escapeRooms/${name}/areas.csv :`);
            console.log(res);
        } else {
            global.allAreas[res.data.id] = res.data;
        }
    }});

    global.allInteracts = {};
    await papaParseAsync(`https://ancilloy.github.io/Zeronpa/scripts/escapeRooms/${name}/interacts.csv`, { download: true, delimiter: ",", header: true, skipEmptyLines: true, step: res => {
        if (res.data == null) {
            console.log(`----- Error ! Unreadable line in https://ancilloy.github.io/Zeronpa/scripts/escapeRooms/${name}/interacts.csv :`);
            console.log(res);
        } else {
            let line = res.data;
            if (global.allInteracts[line.areaId]==null) { global.allInteracts[line.areaId] = {}; }
            global.allInteracts[line.areaId][line.itemId] = line;
        }
    }});

    await readScriptPath(`https://ancilloy.github.io/Zeronpa/scripts/escapeRooms/${name}/dialogues.csv`);

    global.itemsList = [];
    global.areasList = [];
    global.inspectedAreas = {};
    global.currentTab = null;
    global.currentCommandIndex = 0;

    successfulAction(global.allAreas["init"], 0, "init");
}



function inspectArea(index) {
    let area = document.getElementById(`areaInspectSelector-${index}`).value;
    let resultDisplay = document.getElementById(`resultDisplay-${index}`);

    resultDisplay.innerHTML = `Inspected ${global.allAreas[area].name}.`;
    resultDisplay.className = "success";
    if (global.inspectedAreas[area]==null) { global.inspectedAreas[area] = { status: "run", index: 1 } }
    else { global.inspectedAreas[area].index++; }
    successfulAction(global.allAreas[area], index, "inspect");

}

function interactArea(index) {
    let area = document.getElementById(`areaInteractSelector-${index}`).value;
    let item = document.getElementById(`itemInteractSelector-${index}`).value;

    let resultDisplay = document.getElementById(`resultDisplay-${index}`);
    if (global.allInteracts[area]==null || global.allInteracts[area][item]==null) {
        resultDisplay.innerHTML = `Can't use ${global.allItems[item].name} on ${global.allAreas[area].name}.`;
        resultDisplay.className = "failure";
    } else {
        successfulAction(global.allInteracts[area][item], index, "interact");
        resultDisplay.innerHTML = `Used ${global.allItems[item].name} on ${global.allAreas[area].name}.`;
        resultDisplay.className = "success";
    }
}

function successfulAction(line, commandsIndex, mode) {
    let theEnd = false;
    let grantItems = true;

    if (line.dialogue!="") {
        switch(mode) {
            case "inspect":
                grantItems = (global.inspectedAreas[line.id].index==1);
                let listOfDialogues = line.dialogue.split("|");
                if (global.inspectedAreas[line.id].index==listOfDialogues.length) {
                    global.inspectedAreas[line.id].status = "end";
                }

                if(global.inspectedAreas[line.id].status=="end") {
                    global.currentTab = global.dialoguesBank[listOfDialogues[listOfDialogues.length - 1]].cloneNode(true);
                } else {
                    global.currentTab = global.dialoguesBank[listOfDialogues[global.inspectedAreas[line.id].index - 1]];
                }
                break;
            default:
                global.currentTab = global.dialoguesBank[line.dialogue];
                break;
        }
        global.mainSection.appendChild(global.currentTab);
    }

    if (grantItems) {
        if (line.itemsGranted!="") {
            let itemsToGrant = line.itemsGranted.split("|");
            theEnd = itemsToGrant.includes("exit");
            global.itemsList = global.itemsList.concat(itemsToGrant);
        }

        if (line.itemsRemoved!="") {
            let itemsToRemove = line.itemsRemoved.split("|");
            global.itemsList = global.itemsList.filter((item) => !itemsToRemove.includes(item));
        }

        if (line.areasGranted!="") {
            let areasToGrant = line.areasGranted.split("|");
            global.areasList = global.areasList.concat(areasToGrant);
        }

        if (line.areasRemoved!="") {
            let areasToRemove = line.areasRemoved.split("|");
            global.areasList = global.areasList.filter((item) => !areasToRemove.includes(item));
        }
    }


    if (commandsIndex!=0) {
        document.getElementById(`areaInspectSelector-${commandsIndex}`) .disabled = true;
        document.getElementById(`inspectButton-${commandsIndex}`)       .disabled = true;
        document.getElementById(`areaInteractSelector-${commandsIndex}`).disabled = true;
        document.getElementById(`itemInteractSelector-${commandsIndex}`).disabled = true;
        document.getElementById(`interactButton-${commandsIndex}`)      .disabled = true;
    }
    global.currentCommandIndex += 1;

    if (!theEnd) {
        if (global.currentTab==null) {
            global.currentTab = document.createElement("table");
            global.mainSection.appendChild(global.currentTab);
        }
        global.currentTab.appendChild(escapeRoomCommands(global.currentCommandIndex, (mode=="init")));
    } else {
        linkNextPart(global.allItems.exit.name);
    }
}
