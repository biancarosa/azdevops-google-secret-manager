import tl = require("azure-pipelines-task-lib/task");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const client = new SecretManagerServiceClient();

async function run() {
  try {
    let project = tl.getInput("project", true) || "";
    let prefix = tl.getInput("prefix", false) || "";
    console.log("Pushing secrets to GSM")
    tl.getVariables().forEach(async (variable) => {
      if (variable.secret) {
        let secretId = `${prefix}_${variable.name}`;
        try {
          console.info(`Pushing ${secretId}`);
          await client.createSecret({
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
        await client.addSecretVersion({
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
