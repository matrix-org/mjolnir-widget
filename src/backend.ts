import { IOpenIDCredentials } from "matrix-widget-api";
import $ from "jquery";

export class MjolnirBackend {
  constructor(private backend: string, private creds: IOpenIDCredentials) {}

  public async listExisting(): Promise<string[]> {
    return (
      (await $.getJSON(`${this.backend}/list`, {
        openId: this.creds.access_token,
      })) || []
    );
  }

  public async submitCreate(managementRoom: string): Promise<string> {
    const result: { mxid: string } = await $.post(
      `${this.backend}/create`,
      {
        openId: this.creds.access_token,
        roomId: managementRoom,
      },
      "json"
    );
    return result.mxid;
  }

  public async getExisting(mxid: string): Promise<{ managementRoom: string }> {
    const result: { managementRoom: string } = await $.getJSON(
      `${this.backend}/get`,
      {
        openId: this.creds.access_token,
        mxid: mxid,
      }
    );
    return result;
  }
}
