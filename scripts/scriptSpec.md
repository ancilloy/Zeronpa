# Zeronpa scripts specification

This document gives the proper specification of the scripts used for Zeronpa.

## Basic dialogue specification

Most of the dialogues consist of series of CSV lines, composed of the following columns.

### character

This is the name of the character currently speaking. A character name can be anything except for :
- **cmd** : this keyword is reserved for the use of special commands (see below)
- **none** : this is a special character name, reserved for when a character speaks with no portrait.
<!-- End of the list -->
Every character has a directory of their name in the `portraits` directory, containing their specific portraits.

### portrait

The name of the portrait the character will be using for this line. It must match the name of a portrait in the character's `portraits`
folder, minus the .png. Basically, it means that `portraits/{character}/{portrait}.png` must exist in the remote repository, and this is the portrait that will be displayed.<br>
If this cell's content is **none**, then an empty portrait will be displayed (`portraits/none/stand.png`). This also means that if one of the character's portraits is named `none.png`, it can never be used.<br>
This cell can be empty, in which case the character's default portrait will be used (the one named `stand.png` in their folder).

### name

The name that will be displayed under the portrait for this line.<br>
If this cell is empty, the character's default name will be displayed. Characters' default names are defined as follows :
- At the very beginning of `display.js`, a list of default names are defined. If the character has an entry in this list, then their name here will be displayed.
- Otherwise, the character's default name is just their in-code name, but with a capital letter at the beginning.

### text

The text content of their line.<br>
You can color portions of the text :
- Portions between `` `grave accents` `` will be displayed in <span style="color=green;">green</span>. This is intended for narration.
- Portions between `|vertical bars|` will be displayed in <span style="color=dodgerblue;">blue</span>. This is intended for the protagonist's inner thoughts, as well as agree points in non-stop debates.
- Portions between `*asterisks*` will be displayed in <span style="color=orange; font-weight: bold;">orange and bold</span>. This is intended for emphasizing, and weak points in non-stop debates.
<!-- End of the list -->

## Commands

You can insert special commands in your script. To do so, in a dialogue line, write **cmd** in the first cell (character).<br>
The second cell (portrait) will contain the name of the command, and the following cells will contain the arguments of the command.<br>
Here is a list of every command :

### beginDialogue (dialogueName)

This command marks the beginning of a dialogue segment.<br>
If dialogueName is empty, the dialogue is immediately added to the page after being read. Otherwise, it is stored to be displayed later. Each dialogue segment is displayed in one table.

In pure script pages, dialogues usually don't have names. They're all displayed one after the other, with some *decors* put in between (see below).<br>
In escape rooms and trials, dialogues are named to be displayed at the right time, between minigames.

### endDialogue

Marks the end of the last dialogue started with beginDialogue.

### music (musicName)

Inserts music in the next dialogue line. When said dialogue line will become fully visible, the current music playing will be replaced by `musics/{musicName}.mp3`. The details of the music, as noted in `musics/musicnames.csv`, will also be displayed in the side menu.

### decor (decorName)

Displays the image `decors/{decorName}.png` on the page, to illustrate when the characters move to a new area. Mostly intended for pure script pages, since escape rooms and trials fully take place in one single place.<br>
A decor can't be inserted in the middle of a dialogue segment.
