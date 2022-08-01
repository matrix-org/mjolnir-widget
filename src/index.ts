import { IOpenIDCredentials, WidgetApi } from "matrix-widget-api";

import { IInviteCallback, SubmitCreate, SubmitReuse } from "./action";
import { MjolnirBackend } from "./backend";
import { assertParam, parseFragment } from "./utils";

class MjolnirWidget {
  private backend: MjolnirBackend;

  constructor(
    private api: WidgetApi,
    creds: IOpenIDCredentials,
    backend: string
  ) {
    this.backend = new MjolnirBackend(backend, creds);
  }

  public async init(): Promise<boolean> {
    const createButtonView = document.getElementById("createMjolnir");
    const advancedButtonView = document.getElementById("showAdvanced");
    const managementRoomView = document.getElementById(
      "managementRoom"
    ) as HTMLInputElement;
    if (!createButtonView || !advancedButtonView) {
      return false;
    }

    (createButtonView as HTMLButtonElement).disabled = false;

    const submitCreate = new SubmitCreate(
      this.backend,
      managementRoomView,
      this.invite
    );
    createButtonView.onclick = submitCreate.submit.bind(submitCreate);

    advancedButtonView.onclick = this.advanced.bind(this);

    await this.populateExisting();

    return true;
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

      const submitReuse = new SubmitReuse(
        this.backend,
        mjolnirName,
        this.invite
      );
      existingMjolnirView.onclick = submitReuse.submit.bind(submitReuse);

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

  public async invite(mxid: string): Promise<boolean> {
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

class Params {
  constructor(public userId: string, public widgetId: string) {}

  public static from_fragment(): Params {
    const fragment = parseFragment();
    const userId = assertParam(fragment, "userId");
    const widgetId = assertParam(fragment, "widgetId");

    if (userId === null || widgetId === null) {
      throw new Error("missing required param");
    }

    return new Params(userId, widgetId);
  }
}

interface PowerLevels {
  content: {
    users: {
      [mxid: string]: number;
    };
  };
}

(function () {
  const params = Params.from_fragment();
  const api = new WidgetApi(params.widgetId);

  api.start();
  api.requestCapabilityToSendState("m.room.member");
  api.requestCapabilityToReceiveState("m.room.power_levels");

  api.on("ready", async function () {
    const events = (await api.readStateEvents(
      "m.room.power_levels",
      1,
      undefined,
      undefined
    )) as PowerLevels[];

    if (events.length === 0) {
      return;
    } else if ((events[0].content.users[params.userId] ?? 0) <= 0) {
      return;
    }

    const creds = await getOpenId(api);
    if (!creds) {
      return;
    }

    let widget = new MjolnirWidget(api, creds, "https://127.0.0.1");
    await widget.init();
  });
})();
