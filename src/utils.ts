/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function delay(ms: number): Promise<undefined> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
 * copied and ported from
 * https://github.com/matrix-org/matrix-widget-api/blob/bcaad5155e05565bc7c882e3fdbc8af217514a10/examples/widget/utils.js
 */

export function parseFragment(): URLSearchParams {
  const fragmentString = window.location.hash || "?";
  return new URLSearchParams(
    fragmentString.substring(Math.max(fragmentString.indexOf("?"), 0))
  );
}

export function assertParam(
  fragment: URLSearchParams,
  name: string
): string | null {
  const val = fragment.get(name);
  if (!val) {
    return null;
  }
  return val;
}
