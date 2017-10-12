import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import '../../assets/css/styles.css';
import '../../../node_modules/primeng/resources/themes/omega/theme.css';
import '../../../node_modules/primeng/resources/primeng.min.css';
import '../../../node_modules/font-awesome/css/font-awesome.min.css';

import { WordService } from '../services/word-service';
import { Word } from '../models/word';
import { GuessedWord } from '../models/guessed-word';


@Component({
    selector: 'interrogator',
    templateUrl: './interrogator.component.html',
    styleUrls: ['./interrogator.component.css'],
})
export class InterrogatorComponent {

    words: Word[];
    actualWords: Word[] = null;

    word: GuessedWord = null;
    index: number;
    english: string;
    checked: boolean = false;
    wrong: boolean = false;

    constructor(private wordService: WordService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit() {
        this.route.paramMap
            .switchMap((params: ParamMap) =>
                this.wordService.getWords(params.get('id')))
            .subscribe(words => { this.actualWords = words; this.next(); });
        this.route.url.subscribe(url => { console.log(url[0].path); });
    }

    check() {
        if (this.isEqual(this.word.english, this.english)) {
            // if this is the last, then remove from the array
            if (!this.word.lastAnswerWrong || this.actualWords.length === 1) {
                this.actualWords.splice(this.index, 1);
            }
            this.word.incrementCorrectAnswer();
        } else {
            this.word.incrementWrongAnswer();
            this.wrong = true;
        }
        this.checked = true;
        // play the audio if available
        if (this.word.audio) {
            let player: any = document.getElementById('audioplayer');
            player.play();
        }
    }

    private isEqual(expectedArray: string[], actual: string) {
        if (actual === null) { return; }
        let result = false;
        for (let expected of expectedArray) {
            result = expected === actual;
            result = result || expected.toUpperCase() === actual.toUpperCase();
            result = result || this.removeUnnecessaryCharacters(expected).toUpperCase() ===
                this.removeUnnecessaryCharacters(actual).toUpperCase();
            if (result) { return result; }
        }
        return result;
    }

    private removeUnnecessaryCharacters(text: any) {
        let result = '';
        for (let char of text) {
            switch (char) {
                case '?':
                case '.':
                case '!':
                case ':':
                case ',':
                case ';':
                case ' ':
                    break;
                default:
                    result = result + char;
            }
        }
        return result;
    }

    next() {
        let word = this.getRandomWord(this.word && this.word.getWrongAnswerNumber() > 0);
        if (word instanceof GuessedWord || word == null) {
            this.word = word;
        } else {
            // if the word is not GuessedWord, then we create one and replace
            let newWord = new GuessedWord();
            this.clone(word, newWord);
            this.word = newWord;
            this.actualWords[this.index] = this.word;
        }
        this.checked = false;
        this.wrong = false;
        this.english = null;
        if (this.word != null && document.getElementById('english') != null) {
            document.getElementById('english').focus();
        }
    }

    private clone(source: any, target: any) {
        // tslint:disable-next-line:forin
        for (let prop in source) {
            target[prop] = source[prop];
        }
        return target;
    }

    getRandomWord(checkSameIndex: boolean): any {
        let remainingWordsNumber = this.actualWords.length;
        // if no more words, then return null
        if (remainingWordsNumber === 0) {
            return null;
        } else {
            let tempIndex: number = this.getRandomIndex(remainingWordsNumber);
            // if this is the last, then no need to get new random number
            if (checkSameIndex && remainingWordsNumber > 1) {
                while (this.index === tempIndex) {
                    tempIndex = this.getRandomIndex(remainingWordsNumber);
                }
            }
            this.index = tempIndex;
            return this.actualWords[this.index];
        }
    }

    getRandomIndex(length: number): number {
        return Math.floor(Math.random() * length);
    }

    getImageUrl() {
        return require('../../assets/images/' + this.word.imageUrl);
    }

    getAudio() {
        return require('../../assets/audios/' + this.word.audio);
    }

    back(): void {
        this.router.navigate(['']);
    }
}