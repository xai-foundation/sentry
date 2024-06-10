import { NodeLicenseTests } from "./NodeLicense.mjs";
import { parse } from "csv/sync";
import fs from "fs";
import { XaiTests } from "./Xai.mjs";
import { config, createBlsKeyPair } from "@sentry/core";
import { RuntimeTests } from "./Runtime.mjs";
import { UpgradeabilityTests } from "./UpgradeTest.mjs";
import { RefereeTests } from "./Referee.mjs";
import { esXaiTests } from "./esXai.mjs";
import { GasSubsidyTests } from "./GasSubsidy.mjs";
import { XaiGaslessClaimTests } from "./XaiGaslessClaim.mjs";
import { CNYAirDropTests } from "./CNYAirDrop.mjs";
import { StakingV2 } from "./StakingV2.mjs";
import { extractAbi } from "../utils/exportAbi.mjs";
import { Beacons } from "./Beacons.mjs";
import { Forwarder } from "./gasSubsidy/Forwarder.mjs";
import { deployInfrastructureArbOne } from "./deployInfrastructureArbOne.mjs";
import { deployInfrastructureXai } from "./deployInfrastructureXai.mjs";

describe("Fixture Tests", function () {

    // describe("CNY 2024", CNYAirDropTests.bind(this));
    // describe("Xai Gasless Claim", XaiGaslessClaimTests(deployInfrastructureArbOne).bind(this));
    // describe("Xai", XaiTests(deployInfrastructureArbOne).bind(this));
    // describe("EsXai", esXaiTests(deployInfrastructureArbOne).bind(this));
    // describe("Node License", NodeLicenseTests(deployInfrastructureArbOne).bind(this));
    // describe("Referee", RefereeTests(deployInfrastructureArbOne).bind(this));
    // describe("StakingV2", StakingV2(deployInfrastructureArbOne).bind(this));
    // describe("Beacon Tests", Beacons(deployInfrastructureArbOne).bind(this));
    // describe("Gas Subsidy", GasSubsidyTests(deployInfrastructureArbOne).bind(this));
    // describe("Upgrade Tests", UpgradeabilityTests(deployInfrastructureArbOne).bind(this));

    // This doesn't work when running coverage
    // describe("Runtime", RuntimeTests(deployInfrastructureArbOne).bind(this));

    // XAI deploys

    // XAI Subsidy
    describe("Forwarder", Forwarder(deployInfrastructureXai).bind(this));


})
