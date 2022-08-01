import { MjolnirBackend } from "./backend";

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
    const mxid = await this.backend.submitCreate(this.input.value);
    return await this.invite(mxid);
  }
}

export class SubmitReuse implements IAction<boolean> {
  constructor(
    private backend: MjolnirBackend,
    private mxid: string,
    private invite: IInviteCallback
  ) {}
  public async submit() {
    const existing = await this.backend.getExisting(this.mxid);
    return await this.invite(this.mxid);
  }
}
