import { IInviteCallback, MjolnirBackend } from "./backend";

export class SubmitCreate {
  constructor(
    private backend: MjolnirBackend,
    private input: HTMLInputElement
  ) {}
  public async submit() {
    return this.backend.submitCreate(this.input.value);
  }
}

export class SubmitReuse {
  constructor(
    private backend: MjolnirBackend,
    private mxid: string,
    private invite: IInviteCallback
  ) {}
  public async submit() {
    const existing = await this.backend.getExisting(this.mxid);
    return await this.invite(this.mxid, existing.managementRoom);
  }
}
