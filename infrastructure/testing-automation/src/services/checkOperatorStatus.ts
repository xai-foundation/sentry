import Docker from "dockerode";

const docker = new Docker();

export async function checkOperatorStatus(): Promise<boolean> {
  const OPERATOR_CONTAINER = process.env.OPERATOR_CONTAINER;

  if (!OPERATOR_CONTAINER) {
    throw new Error("Operator container name not set in environment variables");
  }

  return new Promise((resolve, reject) => {
    docker.listContainers({ all: true }, (err, containers) => {
      if (err) {
        return reject(err);
      }

      const containerInfo = containers?.find((container) =>
        container.Names.includes(`/${OPERATOR_CONTAINER}`)
      );
      if (!containerInfo) {
        return resolve(false);
      }

      const container = docker.getContainer(containerInfo.Id);
      container.exec(
        {
          Cmd: ["bash", "-c", "screen -ls | grep sentry-cli"],
          AttachStdout: true,
          AttachStderr: true,
        },
        (err, exec) => {
          if (err) {
            return resolve(false);
          }

          if (!exec) {
            return resolve(false);
          }

          exec.start({}, (err, stream) => {
            if (err) {
              return resolve(false);
            }

            let output = "";
            stream?.on("data", (chunk: any) => {
              output += chunk.toString();
            });

            stream?.on("end", () => {
              resolve(output.includes("sentry-cli"));
            });

            stream?.on("error", () => {
              resolve(false);
            });
          });
        }
      );
    });
  });
}
