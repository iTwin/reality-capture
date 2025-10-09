# Change Log - @itwin/reality-data-client

<!-- This log was last generated on Thu, 07 Nov 2024 14:16:10 GMT and should not be manually modified. -->

<!-- Start content -->

## 1.2.2

Thu, 07 Nov 2024 14:16:10 GMT

### Patches

- Update typescript version from v4 to v5 (110406974+dbiguenet@users.noreply.github.com)

## 1.2.1

Wed, 28 Feb 2024 14:48:34 GMT

### Patches

- Updated documentation in RealityData listing query parameters (Marc-Andre.Cote@bentley.com)

## 1.2.0

Mon, 26 Feb 2024 20:54:34 GMT

### Minor changes

- Implemented Additional Request Parameters & RealityData Tags (Marc-Andre.Cote@bentley.com)

## 1.1.0

Tue, 11 Jul 2023 14:02:19 GMT

### Minor changes

- - Ported iTwin/reality-data-client to [Reality Management API](https://developer.bentley.com/apis/reality-management/) following deprecation of [Reality Data API](https://developer.bentley.com/apis/reality-data/) 
- No breaking changes should occur.
- Interfaces with iTwin/core-common should still be respected
- `getRealityDataProjects` method is now deprecated
- `getRealityDataITwins` added to replace deprecated `getRealityDataProjects` method
- `accessControl` property is now deprecated as it is not in Reality Management API. Still defined in `ITwinRealityData` object but does not do anything. (Marc-Andre.Cote@bentley.com)

## 1.0.0

Wed, 31 May 2023 21:24:48 GMT

### Major changes

- 1.0 release of iTwin/reality-data-client (aruniverse@users.noreply.github.com)

## 0.9.0 (2022-06-07)

### - Added new option `authorizationClient` to `RealityDataClientOptions`

Defines Authorization client to use to get access token to Context Share API (authority: <https://ims.bentley.com> )
When defined it will ignore accessToken from API parameters and will get an access token from this client.
