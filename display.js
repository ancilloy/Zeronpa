// ---------- Basenames definition ---------- //
let basenames = {
    "zero"    : "Zero III",
    "oldAkane": "Akane",
    "none"    : ""
};
// ------------------------------------------ //








let musicNames = {};
Papa.parse(`https://ancilloy.github.io/Zeronpa/musics/musicnames.csv`, { download: true, delimiter: ",", header: true, skipEmptyLines: true, step: res => {
    if (res.data == null) {
        console.log("----- Error ! Unreadable line in musicnames.csv :");
        console.log(res);
    } else {
        let line = res.data;
        musicNames[line.id] = line.name;
    }
} });

let musicNameInterval = null;

let musicPlayer = document.getElementById("musicPlayer");
musicPlayer.volume = document.getElementById("volumeBar").value / 100;

let visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            musicChange(entry.target.music);
            visibilityObserver.unobserve(entry.target);
        }
    })
}, {
    threshold: 1
});

function mute() {
    if (musicPlayer.muted) {
        musicPlayer.muted = false;
        document.getElementById("muteButton").innerHTML = 'volume_up';
    } else {
        musicPlayer.muted = true;
        document.getElementById("muteButton").innerHTML = 'volume_off';
    }
}

function pause() {
    if (musicPlayer.paused) {
        musicPlayer.play();
    } else {
        musicPlayer.pause();
    }

    if (musicPlayer.paused) {
        document.getElementById("pauseButton").innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
    } else {
        document.getElementById("pauseButton").innerHTML = '<span class="material-symbols-outlined">pause</span>';
    }
}

function musicChange(name) {
    musicPlayer.src = `musics/${name}.mp3`;
    musicPlayer.play();

    if (musicNameInterval!=null) {
        clearInterval(musicNameInterval);
    }
    if (musicNames[name]!=null) {
        document.getElementById("trackInfo").innerHTML = `Current track : ${musicNames[name]}`;
    } else {
        musicNameInterval = setInterval(() => {
            if (musicNames[name]!=null) {
                document.getElementById("trackInfo").innerHTML = `Current track : ${musicNames[name]}`;
                clearInterval(musicNameInterval);
            }
        }, 1000);
    }
}

function volumeChange(ev) {
    musicPlayer.volume = this.value / 100;
}
document.getElementById("volumeBar").addEventListener("change", volumeChange);






function capitalize(mot) {
    return mot.charAt(0).toUpperCase() + mot.slice(1);
}

let mainSection = document.getElementById("mainSection");
let dialoguesBank = {};

function readScript(scriptName) {
    let state = {
        readingDialogue: false,
        music: null,
        currentTab: null,
        dialogueName: null
    };

    Papa.parse(`https://ancilloy.github.io/Zeronpa/scripts/${scriptName}.csv`, { download: true, delimiter: ",", header: true, skipEmptyLines: true, step: res => {
        if (res.data == null) {
            console.log("----- Error ! Unreadable line :");
            console.log(res);
        } else {
            let line = res.data;
            if (line.character=="cmd") { // First column : if cmd, indicated it is a special command.
                switch(line.portrait) { // Second column : command name
                    case "decor":
                        let decorName = line.name; // Third column : command argument (here, name of the decor to display)
                        let decor = document.createElement("div");
                        decor.className = "decor";
                        decor.innerHTML = `<img src="https://ancilloy.github.io/Zeronpa/decors/${decorName}.png">`;
                        mainSection.appendChild(decor);
                        break;
                    case "beginDialogue":
                        state.currentTab = document.createElement("table");
                        state.currentTab.className = "content";
                        state.dialogueName = line.name; // Third column : command argument (here, name of the dialogue)
                        state.readingDialogue = true;
                        break;
                    case "endDialogue":
                        state.readingDialogue = false;
                        if (state.dialogueName=="") { // If dialogueName is empty, the dialogue is immediately displayed.
                            mainSection.appendChild(state.currentTab);
                        } else { // Else, it is stored in the bank, to be displayed later.
                            dialoguesBank[state.dialogueName] = state.currentTab;
                        }
                        state.currentTab = null;
                        state.dialogueName = null;
                        break;
                    case "music":
                        state.music = line.name; // Third column : command argument (here, name of the dialogue)
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
                        visibilityObserver.observe(tabLine);
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
    let name = (line.name!="") ? line.name : ( basenames[line.character]!=null ? basenames[line.character] : capitalize(line.character) );

    let portrait = (line.portrait!="") ? line.portrait : "stand"; // stand.png is the default portrait for each character.
    let imgPath = (portrait=="none") ? "https://ancilloy.github.io/Zeronpa/portraits/none/stand.png" : `https://ancilloy.github.io/Zeronpa/portraits/${line.character}/${portrait}.png`;

    let portraitCell = document.createElement("td");
    portraitCell.className = "portrait";
    portraitCell.innerHTML = `<img src="${imgPath}"><p>${name}</p>`;
    tabLine.appendChild(portraitCell);

    let textCell = document.createElement("td");
    textCell.innerHTML = line.text;
    tabLine.appendChild(textCell);

    return tabLine;
}
