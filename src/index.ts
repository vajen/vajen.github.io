import { fromEvent, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

interface IItem {
    full_name: string;
    html_url: string;
}

interface Items {
    items: IItem[];
}

const el: HTMLInputElement = document.querySelector('.live-search') as HTMLInputElement;
const ul: HTMLInputElement = document.querySelector('.search-results') as HTMLInputElement;

const text$: Observable<Event> = fromEvent(el, 'input');

const results$: Observable<IItem[]> = text$.pipe(
    debounceTime(500),
    map((ev: Event) => {
        return (ev.target as HTMLInputElement).value;
    }),
    filter((value: string) => value !== ''),
    distinctUntilChanged(),
    switchMap((value: string) => {
            return (fetch(`https://api.github.com/search/repositories?q=${value}`)
                    .then((response: Response) => response.json())
            );
        }
    ),
    map((values: Items) => {
        return values.items;
    }),
    catchError(() => of([]))
);

results$
    .subscribe((results: IItem[]) => {
        showResults(results);
    }, () => {
    }, () => {
        console.log('completed');
    });

function showResults(elem: IItem[]): void {
    ul.innerHTML = '';
    elem.forEach(function (item: IItem): void {
        const li: HTMLLIElement = document.createElement('li');
        li.innerHTML = `<a href='${item.html_url}'>${item.full_name}</a>`;
        ul.appendChild(li);
    });

}