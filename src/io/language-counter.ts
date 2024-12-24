export class LanguageCounter {
    private readonly counters: Map<string, number>;

    public constructor() {
        this.counters = new Map();
    }

    public increment(languageId: string): void {
        const count = this.counters.get(languageId);

        if (count) {
            this.counters.set(languageId, count + 1);
        } else {
            this.counters.set(languageId, 1);
        }
    }

    public toObject(): { [key: string]: number } {
        return Object.fromEntries(this.counters);
    }
}
