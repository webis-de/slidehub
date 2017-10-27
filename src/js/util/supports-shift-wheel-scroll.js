/*
Tests whether the user agent offers regular mouse users (i.e. with a vertical
mouse wheel) a way to trigger horizontal scrolling (i.e. Shift+Wheel).

Microsoft Edge & Mozilla Firefox below version 58 do not offer such interaction
technique.

Detailed explanation: https://github.com/webis-de/slidehub/issues/9
*/

export function supportsShiftWheelScroll() {
  return !userAgentIsEdge() && !userAgentIsFirefoxBelowVersion(58);
}

/*
Returns true for any user agent representing a desktop version of Edge.
*/
function userAgentIsEdge() {
  return window.navigator.userAgent.includes('Edge/');
}

/*
Returns true for any user agent representing Firefox up to a certain version.
*/
function userAgentIsFirefoxBelowVersion(targetVersion) {
  const last = window.navigator.userAgent.split(' ').slice(-1)[0];
  if (last.includes('Firefox/')) {
    const version = last.split('/')[1];
    const majorVersion = parseInt(version.split('.')[0]);
    if (majorVersion < targetVersion) {
      return true;
    }
  }
  return false;
}
