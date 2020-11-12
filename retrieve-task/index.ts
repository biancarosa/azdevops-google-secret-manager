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
      try {
        console.log(`Listing versions for secret ${secret.name}`)
        const [versions] = await client.listSecretVersions({
          parent: secret.name,
        });
        console.log(`Acession version value for secret ${secret.name} and version ${versions[0].name}`)
        const [lastVersion] = await client.accessSecretVersion({
          name: versions[0].name
        })
        tl.setVariable(secret.name.split('/secrets/')[1], lastVersion.payload.data.toString(), true);
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, "Input required: project");
  }
}

run();
