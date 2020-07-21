import tl = require("azure-pipelines-task-lib/task");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const client = new SecretManagerServiceClient();

async function run() {
  try {
    let project = tl.getInput("project", true) || "";

    console.log("Retrieving secrets from GSM")
    const [secrets] = await client.listSecrets({
      parent: `projects/${project}`,
    });
    secrets.forEach(async (secret: any) => {
      const [versions] = await client.listSecretVersions({
        parent: parent,
      });
      const [lastVersion] = await client.accessSecretVersion({
        name: versions[0].name
      })
      tl.setVariable(secret.name.split('/secrets/')[1], lastVersion.payload.data.toString(), true);
    });
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, "Input required: project");
  }
}

run();
