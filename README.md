# linter-spell-word-list

Helper classes to assist in implementation of [linter-spell](https://atom.io/packages/linter-spell) dictionaries based on
word lists.

## Usage

To implement a dictionary which stores its word list in Atom's configuration
manager use an implementation of `provideDictionary` like the following.

```javascript
provideDictionary () {
  let a = new WordListProvider('Plain Text',
    'linter-spell.plainTextWords', [
      'text.plain',
      'text.plain.null-grammar'
    ])
  this.disposables.add(a)
  return provideDictionary())
}
```
