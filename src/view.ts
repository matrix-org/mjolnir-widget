class UnauthorisedView {
  constructor(public container: HTMLElement) {}

  public static from_document(): UnauthorisedView {
    return new UnauthorisedView(document.getElementById("unauthorised")!);
  }
}

class CreateView {
  constructor(
    public container: HTMLElement,
    public submit: HTMLButtonElement
  ) {}

  public static from_document(): CreateView {
    return new CreateView(
      document.getElementById("create")!,
      document.getElementById("createSubmit")! as HTMLButtonElement
    );
  }
}

class ReuseView {
  constructor(public container: HTMLElement, public list: HTMLUListElement) {}

  public static from_document(): ReuseView {
    return new ReuseView(
      document.getElementById("reuse")!,
      document.getElementById("reuseList")! as HTMLUListElement
    );
  }
}

export class View {
  constructor(
    public unauthorised: UnauthorisedView,
    public create: CreateView,
    public reuse: ReuseView
  ) {}

  public static from_document(): View {
    return new View(
      UnauthorisedView.from_document(),
      CreateView.from_document(),
      ReuseView.from_document()
    );
  }
}
