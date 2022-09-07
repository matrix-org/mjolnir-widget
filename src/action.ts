import { MjolnirBackend } from "./backend";
import { WithLoader } from "./ui";

interface IAction<T> {
  submit(): Promise<T>;
}

export interface IInviteCallback {
  (mxid: string): Promise<boolean>;
}

export interface IGetRoom {
  (): string;
}

export interface IReuseComplete {
  (): void;
}

export class SubmitCreate implements IAction<string> {
  constructor(
    private backend: MjolnirBackend,
    private roomId: string,
    private invite: IInviteCallback
  ) {}
  public async submit(): Promise<string> {
    const mxid = await new WithLoader(
      (async () => {
        const mxid = await this.backend.submitCreate(this.roomId);
        await this.invite(mxid);
        await this.backend.submitJoin(mxid, this.roomId);
        return mxid;
      }).bind(this)(),
      0.5
    ).apply();
    return mxid;
  }
}

export class SubmitReuse implements IAction<boolean> {
  constructor(
    private mxid: string,
    private complete: IReuseComplete,
    private invite: IInviteCallback
  ) {}
  public async submit(): Promise<boolean> {
    const result = await new WithLoader(this.invite(this.mxid), 0.5).apply();
    this.complete();
    return result;
  }
}
