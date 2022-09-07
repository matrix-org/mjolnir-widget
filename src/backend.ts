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

  public async submitCreate(roomId: string): Promise<string> {
    const result: { mxid: string } = await $.ajax({
      url: `${this.backend}/create`,
      type: "POST",
      data: JSON.stringify({
        openId: this.creds.access_token,
        roomId: roomId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return result.mxid;
  }

  public async submitJoin(mxid: string, roomId: string): Promise<boolean> {
    await $.ajax({
      url: `${this.backend}/join`,
      type: "POST",
      data: JSON.stringify({
        openId: this.creds.access_token,
        mxid: mxid,
        roomId: roomId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
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
