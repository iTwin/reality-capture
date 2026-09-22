<table>
  <tr>
    <td><img src="https://github.com/iTwin/reality-capture/raw/main/logos/iTwinCaptureIcon.png" alt="iTwin Capture logo" width="96" /></td>
    <td><h1>Reality Capture<sup>&reg;</sup></h1></td>
  </tr>
</table>

Reality Capture is a TypeScript package for interacting with Bentley Reality Capture services.

## Available Services

- **[Reality Modeling](https://developer.bentley.com/apis/contextcapture/):** Create and run reality modeling workflows.
- **[Reality Analysis](https://developer.bentley.com/apis/realitydataanalysis/):** Run analysis workflows on reality data.
- **[Reality Management](https://developer.bentley.com/apis/reality-management/):** Upload, manage, and download reality data.

## Get started

### npm

Install Reality Capture from the [`reality-capture` npm package](https://www.npmjs.com/package/@itwin/reality-capture):

```sh
# Using npm
npm install @itwin/reality-capture --save

# Using yarn
yarn add @itwin/reality-capture

# Using pnpm
pnpm add @itwin/reality-capture
```

Then import the types and APIs you need in your application code:

```ts
import {
  FillImagePropertiesInputs,
} from "@itwin/reality-capture";

const fipInputs: FillImagePropertiesInputs = { imageCollections: ["reality_data_id"] };
```

## Authentication

Create an application that can obtain an iTwin Platform access token, then provide an `AuthorizationClient` implementation when creating `RealityCaptureService`. The client must return a valid Bearer token for each API request. See the [iTwin Platform authentication guide](https://developer.bentley.com/tutorials/create-and-query-itwins-guide/#1-register-an-application) for application registration and authentication setup.

For a service application, install `@itwin/service-authorization` and initialize the SDK as follows:

```sh
npm install @itwin/service-authorization
```

```ts
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { RealityCaptureService } from "@itwin/reality-capture";

const authorizationClient = new ServiceAuthorizationClient({
  clientId: process.env.IMJS_CLIENT_ID ?? "",
  clientSecret: process.env.IMJS_CLIENT_SECRET ?? "",
  scope: "itwin-platform",
  authority: "https://ims.bentley.com",
});

const realityCaptureService = new RealityCaptureService(authorizationClient);
```

## Examples

Explore the [examples](https://github.com/iTwin/reality-capture/tree/main/typescript/examples) for complete Reality Capture usage scenarios.

## Support

Report bugs and request features through the [GitHub issue tracker](https://github.com/iTwin/reality-capture/issues).

## License

This project is licensed under the [MIT License](https://github.com/iTwin/reality-capture/blob/main/LICENSE.md).

## Contributing

See the [contribution guide](https://github.com/iTwin/reality-capture/blob/main/CONTRIBUTING.md).