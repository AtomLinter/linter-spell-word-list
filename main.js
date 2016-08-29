'use babel'

import * as _ from 'lodash'
import { JaroWinklerDistance } from 'natural'
import { Disposable, CompositeDisposable } from 'atom'

export class WordList extends Disposable {

  constructor (options) {
    super(() => {
      this.disposables.dispose()
    })

    this.disposables = new CompositeDisposable()
    _.assign(this, { minimumJaroWinklerDistance: 0.9 }, options)

    this.provider = {
      name: this.name,
      grammarScopes: this.grammarScopes,
      checkWord: (textEditor, languages, range) => this.checkWord(textEditor, languages, range)
    }
  }

  getWords (textEditor, languages) {
    return []
  }

  checkWord (textEditor, languages, range) {
    return new Promise((resolve) => {
      const text = textEditor.getTextInBufferRange(range)
      const words = this.getWords(textEditor, languages)

      if (_.some(words, word => (word.startsWith('!') && text === word.substring(1)) || text.toLowerCase() === word.toLowerCase())) {
        resolve({ isWord: true })
      } else {
        const result = {
          isWord: false,
          suggestions: _.filter(words, word => JaroWinklerDistance(text, word) >= this.minimumJaroWinklerDistance),
          actions: [{
            title: `Add to ${this.name} dictionary`,
            apply: () => this.addWord(textEditor, languages, text.toLowerCase())
          }]
        }
        if (text.toLowerCase() !== text) {
          result.actions.push({
            title: `Add to ${this.name} dictionary (case sensitive)`,
            apply: () => this.addWord('!' + text)
          })
        }
        resolve(result)
      }
    })
  }

  addWord (textEditor, languages, word) {}

  provideDictionary () {
    return this.provider
  }
}

export class ConfigWordList extends WordList {

  constructor (options) {
    super(options)

    this.words = atom.config.get(this.keyPath)
    this.disposables.add(atom.config.onDidChange(this.keyPath,
      ({newValue}) => this.words = newValue))
  }

  getWords (textEditor, languages) {
    return this.words
  }

  addWord (textEditor, languages, word) {
    atom.config.set(this.keyPath, _.concat(this.words, word))
  }

}
