import BootOperatorComponent from "./components/BootOperatorComponent";
import ChallengeIntervalComponent from "./components/ChallengeIntervalComponent";
import DownloadCliComponent from "./components/DownloadCliComponent";
import { HomeComponent } from "./components/HomeComponent";
import OperatorLogsComponent from "./components/OperatorLogsComponent";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <HomeComponent />
      <ChallengeIntervalComponent />
      <DownloadCliComponent />
      <BootOperatorComponent />
      <OperatorLogsComponent />
    </main>
  );
}
