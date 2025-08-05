let musicPlayer = document.getElementById("musicPlayer");
musicPlayer.volume = document.getElementById("volumeBar").value / 100;

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
        document.getElementById("pauseButton").innerHTML = '<span class="material-symbols-outlined">pause</span>';
    } else {
        musicPlayer.pause();
        document.getElementById("pauseButton").innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
    }
}

function volumeChange(ev) {
    musicPlayer.volume = this.value / 100;
}
document.getElementById("volumeBar").addEventListener("change", volumeChange);






let basenames = {};

async function loadBasenames() {
    await Papa.parse("https://ancilloy.github.io/Zeronpa/basenames.csv", { download: true, delimiter: ",", header: true, skipEmptyLines: true, step: res => {
        if (res.data != null) {
            let x = res.data;
            basenames[x.character] = x.name;
        }
    } });
    basenames.music = "yes";
}






function capitalize(mot) {
    return mot.charAt(0).toUpperCase() + mot.slice(1);
}

let currentTab = document.getElementById("firstTab");

async function displayScript(scriptName) {
    if (basenames.music==null) {
        await loadBasenames();
    }

    Papa.parse(`https://ancilloy.github.io/Zeronpa/scripts/${scriptName}.csv`, { download: true, delimiter: ",", header: true, skipEmptyLines: true, step: res => {
        if (res.data != null) {
            let x = res.data;
            let line = document.createElement("tr");

            // If a character has a special name for that line, it will be displayed.
            // If not, their base name will be displayed. For most characters, it is just their name in-code but with a capital.
            // Some other characters have special base names, listed in basenames.csv (example : zero -> Zero III)
            let name = (x.name!="") ? x.name : ( basenames[x.character]!=null ? basenames[x.character] : capitalize(x.character) );

            let portraitCell = document.createElement("td");
            portraitCell.className = "portrait";
            portraitCell.innerHTML = `<img src="https://ancilloy.github.io/Zeronpa/portraits/${x.character}/${x.portrait}.png"><p>${name}</p>`;
            line.appendChild(portraitCell);

            let textCell = document.createElement("td");
            textCell.innerHTML = x.text;
            line.appendChild(textCell);

            currentTab.appendChild(line);
        }
    } });
}

