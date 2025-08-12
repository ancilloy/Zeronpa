# Zeronpa Escape Rooms specification

An escape room in Zeronpa is defined by a directory, containing a few key files used to define the way it functions.

- **items.csv** : defines every item the player may encounter in the escape room.
- **areas.csv** : defines the various areas of the escape room the player can interact with.
- **interacts.csv** : defines the specific interactions of certain items when used on certain areas.
- **dialogues.csv** : this file defines the various dialogues that can occur inside the escape room.
<!-- End of the list -->

Here are the details of these files and their various fields.

## items.csv
### id

The unique id of the item. Can't contain a vertical bar `|`, and can't be **exit**.
**exit** is a special item. Obtaining it means the completion of the excape room.

### name

The name of the item, to be displayed.

### description

The description, for the list of items in the side menu.

## areas.csv
### id

The unique id of the area. Can't contain a vertical bar, and can't be **init**.
**init** is a special area, that's used to define the areas available at the beginning of the escape room, as well as the introductory dialogue.

### name

The name of the area, to be displayed.

### dialogueOnInspection

The dialogue to be displayed when the player inspects this area.

### itemsGrantedOnInspection

The items the player obtains upon inspecting this area. If there are several, each must be separated by a vertical bar.

### itemsRemovedOnInspection

The items the player loses upon inspecting this area. If there are several, each must be separated by a vertical bar.

### areasGrantedOnInspection

The areas that become available upon inspecting this area. If there are several, each must be separated by a vertical bar.

### areasRemovedOnInspection

The areas that become unavailable upon inspecting this area. If there are several, each must be separated by a vertical bar.

## interacts.csv
### areaId

The id of the area in the interaction.

### itemId

The id of the item in the interaction.

### dialogue

The dialogue to display when the interaction is made.

### itemsGranted

The items the player obtains upon doing the interaction. If there are several, each must be separated by a vertical bar.

### itemsRemoved

The items the player loses upon doing the interaction. If there are several, each must be separated by a vertical bar.

### areasGranted

The areas that become available upon doing the interaction. If there are several, each must be separated by a vertical bar.

### areasRemoved

The areas that become unavailable upon doing the interaction. If there are several, each must be separated by a vertical bar.

## dialogues.csv

The dialogue segments are defined like any other script. See [script specification](../scriptSpec.md) for more details.
