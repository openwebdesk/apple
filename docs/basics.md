# Basics of Apple
There are many components working together inside Apple.

## Applications
Apple applications are written in javascript. Applications does not include a document, window, DOM capabilities, navigator, location since they run inside a seperate isolated worker context. What they have is a couple of interfaces that allow them to read incoming data and write data towards the system.

Behind the scenes, Apple uses the messaging API to communcate with the worker.

### Data output
1. Using the function's return: The best way to output data is to add parameters when returning the main function.
2. Using the Apple API's console write function

### Output formatting using Apple text styling
It's an interpreted markdown language that inherits styling from preceding and considers it a parent styling.

For example, in the string "my dog is a cat", the word dog can be a key or the context for the rest of the sentence.

#### Syntax
```css
%key:value% <text> %key:value% ...
```
Example usage:
```css
%font-size: 14px% The world is %font-size: 24px% HUGE %font-size: 14px%
```
#### Output:

It's okay to leave text in style without resetting its styles. This is because the interpreter resets every block of text and `\n` statements (**exception**: pure text).

#### Text types
Types are essentially templates of preformatted text styles, these include normal text, code blocks, and so on. 

```
%type: code_block%
%type: pure_text%
%type: pure_text_end%
%type: kbd%
```
#### Pure text twist
pure_text is a text type, but it comes with a twist. Any text styling declaration inside pure text will be ignored. Example:

```css
%type: pure_text% hello %font-size: 24px% world %type: pure_text_end%
```
As shown in the example, to end a pure text block, you must use the `pure_text_end` type .

#### Multiple declarations
Multiple declarations allow you to declare multiple styles in a single block of text without using many % enclosed blocks. Example:
```css
%font-size:10px; color:#ababab;% text
```

### Console write
There are two methods to write into consule using the API's write function.
1. Static printing: Just print a string directly into terminal. No ability to reference or update later.
2. Dynamic printing: Returns a reference ID to the printed log which the app can later edit.

## Filesystem
Apple uses an IndexedDB virtual file system. It enables fast resource management without lag spikes.

Within an application, you can use the API's `readFile` function to access file content using the file's path.