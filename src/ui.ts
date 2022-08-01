import { delay } from "./utils";

export class WithLoader<T> {
  constructor(private promise: Promise<T>, private minimum: number = 0) {}

  public async apply(): Promise<T> {
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.innerHTML = "<div></div>";

    const start = performance.now();

    document.body.appendChild(loader);
    try {
      return await this.promise;
    } finally {
      await delay(this.minimum * 1000 - (start - performance.now()));
      document.body.removeChild(loader);
    }
  }
}
