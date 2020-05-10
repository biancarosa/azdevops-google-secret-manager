import tl = require("azure-pipelines-task-lib/task");
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager'); 
const client = new SecretManagerServiceClient();

async function run() {
    let prefix = tl.getInput("prefix", false) || ""
    let project = tl.getInput("project", true) || ""
    let pushSecrets = tl.getBoolInput("pushSecret", true) || false

    try {
        if (pushSecrets) {
            tl.getVariables().forEach((variable) => {
                if (variable.secret) {
                    let secretId = `${prefix}${variable.name}`;
                    const [secret] = client.createSecret({
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
            });
      } 
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
