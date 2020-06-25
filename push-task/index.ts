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
        try {
          console.info(`Pushing ${secretId}`);
          client.createSecret({
            parent: `projects/${project}`,
            secret: {
              name: secretId,
              replication: {
                automatic: {},
              },
            },
            secretId,
          });
        } catch (err) {
          console.error(err);
        }
        console.info(`Created secret ${secretId}`);
        console.info(`Adding secret version`);
        client.addSecretVersion({
          parent: `projects/${project}/secrets/${secretId}`,
          payload: {
            data: Buffer.from(variable.value, "utf8"),
          },
        });
        console.info(`Added new secret version`);
      }
    });
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
