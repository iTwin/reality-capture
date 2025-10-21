/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/**
 * Helper class for angle conversions. 
 * Copied from https://github.com/iTwin/itwinjs-core/blob/39a5daf889326f1dcf9d2c3d6149b517898960e7/core/geometry/src/geometry3d/Angle.ts
 */
export class Angle {
  /**
   * Convert an angle in radians to degrees.
   * @param radians angle
   */
  public static radiansToDegrees(radians: number): number {
    if (radians < 0)
      return -Angle.radiansToDegrees(-radians);
    // Now radians is positive ...
    const pi = Math.PI;
    const factor = 180.0 / pi;
    /* the following if statements are for round-off reasons. The problem is that no IEEE number is
      * an exact hit for any primary multiple of pi (90, 180, etc). The following is supposed to have
      * a better chance that if the input was computed by direct assignment from 90, 180, etc degrees
      * it will return exactly 90,180 etc.
      */
    if (radians <= 0.25 * pi)
      return factor * radians;
    if (radians < 0.75 * pi)
      return 90.0 + 180 * ((radians - 0.5 * pi) / pi);
    if (radians <= 1.25 * pi)
      return 180.0 + 180 * ((radians - pi) / pi);
    if (radians <= 1.75 * pi)
      return 270.0 + 180 * ((radians - 1.5 * pi) / pi);
    // all larger radians reference from 360 degrees (2PI)
    return 360.0 + 180 * ((radians - 2.0 * pi) / pi);
  }
}