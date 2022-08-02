import { IOpenIDCredentials, WidgetApi } from "matrix-widget-api";

import { IInviteCallback, SubmitCreate, SubmitReuse } from "./action";
import { MjolnirBackend } from "./backend";
import { assertParam, parseFragment } from "./utils";
import { View } from "./view";

class MjolnirWidget {
  private backend: MjolnirBackend;

  constructor(
    private view: View,
    private api: WidgetApi,
    creds: IOpenIDCredentials,
    backend: string
  ) {
    this.backend = new MjolnirBackend(backend, creds);
  }

  public async init(): Promise<boolean> {
    this.view.create.submit.disabled = false;

    const submitCreate = new SubmitCreate(
      this.backend,
      this.view.createAdvanced.room,
      this.invite
    );
    this.view.create.submit.onclick = submitCreate.submit.bind(submitCreate);
    this.view.createAdvanced.toggle.onclick = this.advanced.bind(this);

    await this.populateExisting();

    return true;
  }

  private async populateExisting() {
    const existingMjolnirs = await this.backend.listExisting();

    while (this.view.reuse.list.firstChild) {
      this.view.reuse.list.removeChild(this.view.reuse.list.firstChild);
    }

    for (const mjolnirName of existingMjolnirs) {
      const existingMjolnirView = document.createElement("li");

      const submitReuse = new SubmitReuse(mjolnirName, this.invite);
      existingMjolnirView.onclick = submitReuse.submit.bind(submitReuse);

      existingMjolnirView.textContent = mjolnirName;
      this.view.reuse.list.appendChild(existingMjolnirView);
    }

    this.view.reuse.container.style.display =
      existingMjolnirs.length > 0 ? "block" : "none";
  }

  private advanced() {
    if (this.view.createAdvanced.room.style.display !== "block") {
      this.view.createAdvanced.room.style.display = "block";
    } else {
      this.view.createAdvanced.room.style.display = "none";
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
    const view = View.from_document();

    const events = (await api.readStateEvents(
      "m.room.power_levels",
      1,
      undefined,
      undefined
    )) as PowerLevels[];

    if (
      events.length === 0 ||
      (events[0].content.users[params.userId] ?? 0) <= 0
    ) {
      view.unauthorised.container.style.display = "initial";
      return;
    }

    view.create.container.style.display = "block";

    const creds = await getOpenId(api);
    if (!creds) {
      return;
    }

    let widget = new MjolnirWidget(
      view,
      api,
      creds,
      "https://husky.lolnerd.net/jess/widget"
    );
    await widget.init();
  });
})();
