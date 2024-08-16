import Docker from "dockerode";
import fs from "fs";
import path from "path";
import {getSignerFromPrivateKey} from "@/services/getSignerFromPrivateKey";

const docker = new Docker();
let containerInstance: any = null;

const UPLOAD_DIR = process.env['UPLOAD_DIR'] || "";
const versionsDir = path.join(UPLOAD_DIR, "versions");
const statusFileDir = path.join(UPLOAD_DIR, "status");
const filePath = path.join(process.cwd(), "logs", "localErrors.log");

const OPERATOR_CONTAINER = process.env["OPERATOR_CONTAINER"];

const timestamp = new Date().toISOString().replace(/T/, '-').replace(/\..+/, '').replace(/:/g, '-');
const logFilePath = `/app/logs/sentry-cli-${timestamp}`;

const execCommandInContainer = async (
      containerName: string,
      command: string[]
    ) => {
      try {
        // Get the container
        const container = docker.getContainer(containerName);

        // Create the exec instance
        const exec = await container.exec({
          AttachStdout: true,
          AttachStderr: true,
          Cmd: command,
        });

        // Start the exec instance
        const stream = await exec.start({ hijack: true, stdin: true });

        // Stream the output
        stream.on("data", (data) => {
          console.log(data.toString());
        });

        // Handle stream end
        stream.on("end", () => {
          console.log("Command execution finished");
        });
      } catch (error) {
        console.error("Error executing command:", error);
      }
    };

export const startOperator = async (version: string, privateKey: string) => {
  try {
    if (!OPERATOR_CONTAINER) {
      throw new Error("Operator name not set in env");
    }

    const { address } = getSignerFromPrivateKey(privateKey);


    execCommandInContainer(OPERATOR_CONTAINER, [
      "bash",
      "-c",
      `
    chmod +x versions/${version}/sentry-node-cli-linux &&
    cd versions/${version} &&
    screen -L -Logfile ${logFilePath}-${version}.log -d -m -S sentry-cli ./sentry-node-cli-linux &&
    screen -r sentry-cli -X stuff '\n' &&
    screen -r sentry-cli -X stuff '\n' &&
    screen -r sentry-cli -X stuff 'boot-operator\n' &&
    sleep 5 && 
    screen -r sentry-cli -X stuff '${privateKey}\n' &&
    sleep 2 &&
    screen -r sentry-cli -X stuff 'n\n' &&
    echo '' > /dev/clipboard  // Clearing privateKey
    `
    ]);

  } catch (error: any) {
    await logMessage(`Error starting operator: ${error.message}`);
    return { success: false, message: 'Error starting operator.', details: error.message };
  }
};

export const stopOperator = async () => {
  try {
    const stopScreenSession = (
      containerName: string,
      screenSessionName: string
    ) => {
      execCommandInContainer(containerName, [
        "bash",
        "-c",
        `screen -S ${screenSessionName} -X quit`,
      ]);
    };

    if (!OPERATOR_CONTAINER) {
      throw new Error("Operator name not set in env");
    }

    stopScreenSession(OPERATOR_CONTAINER, "sentry-cli");
  } catch (error: any) {
    await logMessage(`Error stopping operator: ${error.message}`);
    console.error("Error stopping operator:", error);
    return {
      success: false,
      message: "Error stopping operator.",
      details: error.message,
    };
  }
};

// Helper function to ensure directory exists in container
const ensureDirectoryExistsInContainer = async (directoryPath: any) => {
  try {
    const stats = await fs.promises.stat(directoryPath);
    if (!stats.isDirectory()) {
      throw new Error(`${directoryPath} is not a directory.`);
    }
  } catch (error) {
    console.error(
      `Directory ${directoryPath} does not exist or is not accessible:`,
      error
    );
    throw error;
  }
};

const ensureStatusDirectory = async () => {
  try {
    await fs.promises.access(statusFileDir, fs.constants.F_OK); // Check if directory exists
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // Directory doesn't exist, create it
      await fs.promises.mkdir(statusFileDir, { recursive: true });
      console.log(`Created status directory: ${statusFileDir}`);
    } else {
      throw error; // Throw any other access errors
    }
  }
};

// Helper function to get container logs
const getContainerLogs = async (
  container: Docker.Container
): Promise<string> => {
  try {
    const logs = await container.logs({
      follow: false,
      stdout: true,
      stderr: true,
    });

    return logs.toString();
  } catch (error) {
    console.error("Error fetching container logs:", error);
    throw error;
  }
};

// Helper function to log messages to the status file
const logMessage = async (message: string): Promise<void> => {
   fs.writeFile(filePath, message, { flag: "a+" }, (err) => {
     if (err) {
       console.error("Error writing to file:", err);
     }
   });
};
