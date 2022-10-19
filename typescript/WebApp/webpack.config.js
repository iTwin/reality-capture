const path = require("path");
const glob = require("glob");
const webpack = require("webpack");
const fs = require("fs");

/** Loads the provided `.env` file into process.env */
function loadEnv(envFile) {
  if (!fs.existsSync(envFile))
    return;

  const dotenv = require("dotenv"); // eslint-disable-line @typescript-eslint/no-var-requires
  const dotenvExpand = require("dotenv-expand").expand; // eslint-disable-line @typescript-eslint/no-var-requires
  const envResult = dotenv.config({ path: envFile });
  if (envResult.error) {
    throw envResult.error;
  }

  dotenvExpand(envResult);
}

loadEnv(path.join(__dirname, ".env"));

function createConfig() {
  const config = {
    target: 'web',
    mode: "development",
    entry: glob.sync(path.resolve(__dirname, "lib/**/*.test.js")),
    output: {
      path: path.resolve(__dirname, "lib/integration-tests/webpack/"),
      filename: "bundled-tests.js",
      devtoolModuleFilenameTemplate: "file:///[absolute-resource-path]"
    },
    devtool: "nosources-source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "source-map-loader",
          enforce: "pre"
        },
        {
          test: /azure-storage|AzureFileHandler|UrlFileHandler/,
          use: "null-loader"
        },
      ]
    },
    stats: "errors-only",
    optimization: {
      nodeEnv: "production"
    },
    externals: {
      fs:    "commonjs fs",
      path:  "commonjs path"      
    },
    plugins: [
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === "development") { ... }. See `./env.js`.
      new webpack.DefinePlugin({
        "process.env": Object.keys(process.env)
          .filter((key) => {
            return key.match(/^imjs_/i);
          })
          .reduce((env, key) => {
            env[key] = JSON.stringify(process.env[key]);
            return env;
          }, {}),
      })
    ],
  };
  return config;
}

// Exporting two configs in a array like this actually tells webpack to run twice - once for each config.
module.exports = [
  // createConfig(true),
  createConfig(false)
]