import { IOpenIDCredentials, WidgetApi } from "matrix-widget-api";

import { SubmitCreate, SubmitReuse } from "./action";
import { IInviteCallback, MjolnirBackend } from "./backend";

class MjolnirWidget {
  private backend: MjolnirBackend;

  constructor(
    private api: WidgetApi,
    creds: IOpenIDCredentials,
    backend: string
  ) {
    this.backend = new MjolnirBackend(backend, creds, this.invite);
  }

  public async init() {
    const createButtonView = document.getElementById("createMjolnir");
    const advancedButtonView = document.getElementById("showAdvanced");
    const managementRoomView = document.getElementById(
      "managementRoom"
    ) as HTMLInputElement;
    if (!createButtonView || !advancedButtonView) {
      return;
    }

    (createButtonView as HTMLButtonElement).disabled = false;
    createButtonView.onclick = new SubmitCreate(
      this.backend,
      managementRoomView
    ).submit;

    advancedButtonView.onclick = this.advanced.bind(this);

    await this.populateExisting();
  }

  private async populateExisting() {
    const reuseContainerView = document.getElementById("reuseMjolnir");
    if (!reuseContainerView) {
      return;
    }

    const existingMjolnirs = await this.backend.listExisting();

    if (!existingMjolnirs) {
      return;
    }

    const existingMjolnirsView = document.getElementById("existingMjolnirs");
    if (!existingMjolnirsView) {
      return;
    }

    var existingMjolnirView;
    while (existingMjolnirsView.firstChild) {
      existingMjolnirsView.removeChild(existingMjolnirsView.firstChild);
    }

    for (const mjolnirName of existingMjolnirs) {
      const existingMjolnirView = document.createElement("li");
      existingMjolnirView.onclick = new SubmitReuse(
        this.backend,
        mjolnirName,
        this.invite
      ).submit;
      existingMjolnirView.textContent = mjolnirName;
      existingMjolnirsView.appendChild(existingMjolnirView);
    }

    reuseContainerView.style.display =
      existingMjolnirs.length > 0 ? "initial" : "none";
  }

  private advanced() {
    const advanced = document.getElementById("advanced");
    if (!advanced) {
      return;
    }

    if (advanced.style.display !== "initial") {
      advanced.style.display = "initial";
    } else {
      advanced.style.display = "none";
    }
  }

  public async invite(mxid: string, roomId: string): Promise<boolean> {
    await this.api.sendStateEvent("m.room.member", mxid, {
      membership: "invite",
    });

    //TODO: false if it failed
    return true;
  }
}

async function getOpenId(api: WidgetApi): Promise<IOpenIDCredentials | null> {
  try {
    return await api.requestOpenIDConnectToken();
  } catch (e) {
    // no token for us :(
    return null;
  }
}

(function () {
  const api = new WidgetApi(undefined);
  api.start();
  api.requestCapabilityToSendState("m.room.member");
  api.on("ready", async function () {
    const creds = await getOpenId(api);
    if (!creds) {
      return;
    }

    new MjolnirWidget(api, creds, "https://127.0.0.1").init();
  });
})();
