// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./PoolBeacon.sol";

contract PoolProxyDeployer is
    Initializable,
    AccessControlEnumerableUpgradeable
{
    address public poolBeacon;
    address public keyBucketBeacon;
    address public esXaiBeacon;

    function initialize(
        address poolFactoryAddress,
        address _poolBeacon,
        address _keyBucketBeacon,
        address _esXaiBeacon
    ) public initializer {
        __AccessControlEnumerable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, poolFactoryAddress);
        poolBeacon = _poolBeacon;
        keyBucketBeacon = _keyBucketBeacon;
		esXaiBeacon = _esXaiBeacon;
    }

    function createPool()
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (
            address poolProxy,
            address keyBucketProxy,
            address esXaiBucketProxy
        )
    {
        poolProxy = address(new BeaconProxy(poolBeacon, ""));

        keyBucketProxy = address(new BeaconProxy(keyBucketBeacon, ""));

        esXaiBucketProxy = address(new BeaconProxy(esXaiBeacon, ""));
    }
}
