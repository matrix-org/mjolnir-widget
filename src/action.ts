import { MjolnirBackend } from "./backend";
import { WithLoader } from "./ui";

interface IAction<T> {
  submit(): Promise<T>;
}

export interface IInviteCallback {
  (mxid: string): Promise<boolean>;
}

export class SubmitCreate implements IAction<boolean> {
  constructor(
    private backend: MjolnirBackend,
    private input: HTMLInputElement,
    private invite: IInviteCallback
  ) {}
  public async submit() {
    const mxid = await new WithLoader(
      this.backend.submitCreate(this.input.value),
      0.5
    ).apply();
    return await this.invite(mxid);
  }
}

export class SubmitReuse implements IAction<boolean> {
  constructor(private mxid: string, private invite: IInviteCallback) {}
  public async submit() {
    return await new WithLoader(this.invite(this.mxid), 0.5).apply();
  }
}
