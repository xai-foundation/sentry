import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Approval } from "../generated/schema"
import { Approval as ApprovalEvent } from "../generated/NodeLicense/NodeLicense"
import { handleApproval } from "../src/node-license"
import { createApprovalEvent } from "./node-license-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
 
})
