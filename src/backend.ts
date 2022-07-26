import { IOpenIDCredentials } from "matrix-widget-api";
import $ from "jquery";

export interface IInviteCallback {
  (mxid: string, roomId: string): Promise<boolean>;
}

export class MjolnirBackend {
  constructor(
    private backend: string,
    private creds: IOpenIDCredentials,
    private invite: IInviteCallback
  ) {}

  public async listExisting(): Promise<string[]> {
    return (
      (await $.getJSON(`${this.backend}/list`, {
        openId: this.creds,
      })) || []
    );
  }

  public async submitCreate(managementRoom: string): Promise<string> {
    const result: { mxid: string } = await $.post(
      `${this.backend}/create`,
      {
        openId: this.creds,
        roomId: managementRoom,
      },
      "json"
    );

    this.invite(result.mxid, managementRoom);

    return result.mxid;
  }

  public async getExisting(mxid: string): Promise<{ managementRoom: string }> {
    const result: { managementRoom: string } = await $.getJSON(
      `${this.backend}/get`,
      {
        openId: this.creds,
        mxid: mxid,
      }
    );
    return result;
  }
}
