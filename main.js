'use babel'

import * as _ from 'lodash'
import { Disposable, CompositeDisposable } from 'atom'

export class WordList extends Disposable {

  constructor (name, grammarScopes) {
    super(() => {
      this.disposables.dispose()
    })

    this.disposables = new CompositeDisposable()
    this.name = name

    this.provider = {
      name: name,
      grammarScopes: grammarScopes,
      checkWord: (textEditor, languages, range) => this.checkWord(textEditor, languages, range)
    }
  }

  getWords () {
    return []
  }

  checkWord (textEditor, languages, range) {
    {
      const text = textEditor.getTextInBufferRange(range)
      for (const word of this.getWords()) {
        if ((word.startsWith('!') && text === word.substring(1)) || text.toLowerCase() === word.toLowerCase()) {
          return { isWord: true }
        }
      }
      const result = {
        isWord: false,
        actions: [{
          title: `Add to ${this.name} dictionary`,
          apply: () => this.addWord(text, false)
        }]
      }
      if (text.toLowerCase() !== text) {
        result.actions.push({
          title: `Add to ${this.name} dictionary (case sensitive)`,
          apply: () => this.addWord(text, true)
        })
      }
      return result
    }
  }

  addWord (word, caseSensitive) {}

  provideDictionary () {
    return this.provider
  }
}

export class ConfigWordList extends WordList {

  constructor (name, grammarScopes, keyPath) {
    super(name, grammarScopes)

    this.keyPath = keyPath
    this.words = atom.config.get(keyPath)
    this.disposables.add(atom.config.onDidChange(keyPath, ({newValue}) => this.words = newValue))
  }

  getWords () {
    return this.words
  }

  addWord (word, caseSensitive) {
    atom.config.set(this.keyPath, _.concat(this.words, caseSensitive ? '!' + word : word.toLowerCase()))
  }

}
