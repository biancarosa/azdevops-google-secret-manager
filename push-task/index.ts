import tl = require("azure-pipelines-task-lib/task");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const client = new SecretManagerServiceClient();

async function run() {
  let prefix = tl.getInput("prefix", false) || "";
  let project = tl.getInput("project", true) || "";

  try {
    console.log("Pushing secrets to GSM")
    tl.getVariables().forEach((variable) => {
      if (variable.secret) {
        let secretId = `${prefix}_${variable.name}`;
        let [secret] = client.getSecret({
          parent: `projects/${project}`,
          secret: secretId,
        });
        if (secret) {
          console.info(`Already found ${secretId}`);
        } else {
          console.info(`Secret not found, pushing ${secretId}`);
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
          console.info(`Created secret ${secret}`);
        }
        console.info(`Adding secret version`);
        const [version] = client.addSecretVersion({
          parent: `projects/${project}/${secretId}`,
          payload: {
            data: Buffer.from(variable.value, "utf8"),
          },
        });
        console.info(`Added secret version ${version.name}`);
      }
    });
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
