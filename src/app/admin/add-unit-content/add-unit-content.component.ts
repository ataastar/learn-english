import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Word } from 'src/app/models/word';
import { WordService } from 'src/app/services/word-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Phrase } from 'src/app/models/phrase';
import { Subscription } from 'rxjs';
import { TranslationToSave } from 'src/app/models/translation-to-save';

@Component({
  selector: 'app-add-unit-content',
  templateUrl: './add-unit-content.component.html',
  styleUrls: ['./add-unit-content.component.css']
})
export class AddUnitContentComponent implements OnInit {

  unitId: string;
  unitWords: Word[];
  fromPhrases: Phrase[] = [new Phrase('')];
  toPhrases: Phrase[] = [new Phrase('')];
  example: String;
  translatedExample: String;

  constructor(private wordService: WordService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.unitWords = this.wordService.getActualWords();
    if (!this.unitWords) {
      this.route.paramMap.pipe(switchMap((params: ParamMap) => {
        this.unitId = params.get('id');
        return this.wordService.getWords(this.unitId);
      })).subscribe(words => {
        if (words != null) {
          this.unitWords = words;
        } else {
          this.unitWords = new Array(0);
        }
      });
    } else {
      this.route.paramMap.pipe(switchMap((params: ParamMap) => {
        return this.unitId = params.get('id');
      }));
    }
  }

  public toString(phraseArray: Phrase[]): String {
    let result = "";
    for (const phrase of phraseArray) {
      result = result + ";" + phrase.phrase;
    }
    result = result.substr(1);
    return result;
  }

  addFrom() {
    this.fromPhrases.push(new Phrase(''));
  }

  addTo() {
    this.toPhrases.push(new Phrase(''));
  }

  add(): void {
    if (!this.isPhrasesFilled(this.fromPhrases) || !this.isPhrasesFilled(this.toPhrases)) {
      return;
    }

    let translation = new TranslationToSave(this.unitId, this.getPhraseStrings(this.fromPhrases),
      this.getPhraseStrings(this.toPhrases), this.example, this.translatedExample)

    this.wordService.addUnitContent(translation).then(unitContentId => {
      if (unitContentId) {
        let word = new Word(unitContentId, this.fromPhrases, this.toPhrases, this.example, this.translatedExample);
        this.unitWords.push(word);
        // clear the inputs
        this.fromPhrases = [new Phrase('')];
        this.toPhrases = [new Phrase('')];
        this.example = '';
        this.translatedExample = '';
      }
    });
  }

  remove(wordToRemove: Word): void {
    this.wordService.removeUnitContent(parseInt(wordToRemove.id)).then(res => {
      if (res) {
        const index = this.unitWords.indexOf(wordToRemove, 0);
        if (index > -1) {
          this.unitWords.splice(index, 1);
        }
      }
    });
    return;
  }

  private getPhraseStrings(phrases: Phrase[]): String[] {
    let strings: String[] = new Array();
    phrases.forEach(phrase => {
      strings.push(phrase.phrase);
    });
    return strings;
  }

  private isPhrasesFilled(phrases: Phrase[]): boolean {
    let result = true;
    phrases.forEach(phrase => {
      if (phrase === undefined || phrase == null) {
        result = false;
        return;
      } else if (phrase.phrase == undefined || phrase.phrase == null || phrase.phrase.trim() == '') {
        result = false;
        return;
      }
    });
    return result;
  }

}
