
import { SubmittingAndClaimingPreTK } from "./SubmittingAndClaimingPreTK.mjs";
import { esXaiTestsPreTK } from "./esXaiPreTK.mjs";
import { NodeLicensePreTK } from "./NodeLicensePreTK.mjs";
import { RefereeTestsPreTK } from "./PreTinyKeysRefereeTests.mjs";
import { getBasicPoolConfiguration } from "../StakingV2.mjs";


export function PreTinyKeysTests(deployInfrastructure) {
	return function () {
		describe("Referee Pre-TK", RefereeTestsPreTK(deployInfrastructure).bind(this));
		describe("Submitting And Claiming Pre Tiny Keys", SubmittingAndClaimingPreTK(deployInfrastructure, getBasicPoolConfiguration()).bind(this));
		describe("EsXai Pre-Tiny Keys", esXaiTestsPreTK(deployInfrastructure).bind(this));
		describe("Node License Pre-Tiny Keys", NodeLicensePreTK(deployInfrastructure).bind(this));
	}
}
