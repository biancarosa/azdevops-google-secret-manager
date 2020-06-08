import tl = require("azure-pipelines-task-lib/task");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const client = new SecretManagerServiceClient();

async function run() {
  let prefix = tl.getInput("prefix", false) || "";
  let project = tl.getInput("project", true) || "";
  let pushSecrets = tl.getBoolInput("pushSecrets", true) || false;

  try {
    if (pushSecrets) {
      tl.getVariables().forEach((variable) => {
        if (variable.secret) {
          let secretId = `${prefix}${variable.name}`;
          let [secret] = client.getSecret({
            parent: parent,
            secret: secretId,
          });
          if (secret) {
            console.info(`Already found ${secret.name}`);
          } else {
            [secret] = client.createSecret({
              parent: `projects/${project}`,
              secret: {
                name: secretId,
                replication: {
                  automatic: {},
                },
              },
              secretId,
            });
            console.info(`Created secret ${secret.name}`);
          }
          const [version] = client.addSecretVersion({
            parent: secret.name,
            payload: {
              data: Buffer.from(variable.value, "utf8"),
            },
          });
          console.info(`Added secret version ${version.name}`);
        }
      });
    }
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
