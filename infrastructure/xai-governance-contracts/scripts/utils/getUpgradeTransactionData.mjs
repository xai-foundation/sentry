import hardhat from "hardhat";
const { ethers } = hardhat;

/**
 * Create upgrade call data
 * 
 * @param {string} [opts.upgradeCallFunctionName] - e.g. "initialize"
 * @param {string} [opts.upgradeCallFunctionSignature] - e.g. "function initialize(address,uint256)"
 * @param {Array}  [opts.upgradeCallFunctionParams] - e.g. ["0x1234...", 42]
 * @returns {string} The ABI-encoded transaction data
 */
export function getUpgradeAndCallData(
  {
    upgradeCallFunctionName,
    upgradeCallFunctionSignature,
    upgradeCallFunctionParams
  } = {}
) {

  const initIface = new ethers.Interface([upgradeCallFunctionSignature]);
  const initData = initIface.encodeFunctionData(
    upgradeCallFunctionName,
    upgradeCallFunctionParams
  );

  return initData;

}