# CLI documentation
The built in command line interface allows the user to communicate with the apple system by using text directly without graphical reliance.

## Default commands
1. `cd`: Change current directory
      - directory name (name || `..` for parent)
2. `ls`: List items in current directory
3. `cls`: Clear terminal
4. `mkfile`: Create a new file in the current directory.
      - file name
      - file content (spaces allowed)
5. `mkdir`: Create a new directory in the current directory.
      - directory name
6. `rm`: Remove a directory or a file.
      - item name (directory name||file name)
7. `clearIDB`: Remove all directories and files, clear the system.
8. `upload`: Upload a file in to the Virtual File System.

## Command syntax
```sh
appName param1 param2 ... paramN
```
- Params are seperated by spaces; Spaces are param terminators.
- Spaces within quotes in params are treated as param content.
- You can escape quotes, by using a back-slash before it (`\"`)