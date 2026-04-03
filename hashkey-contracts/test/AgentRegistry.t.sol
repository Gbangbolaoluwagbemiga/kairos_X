// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AgentRegistry.sol";

contract AgentRegistryTest is Test {
    AgentRegistry registry;

    function setUp() external {
        registry = new AgentRegistry(address(this));
    }

    function testRegisterAndGet() external {
        bytes32 key = keccak256("oracle");
        registry.registerAgent(key, address(0xBEEF), "Price Oracle", "price", 1e15);
        AgentRegistry.Agent memory a = registry.getAgent(key);
        assertEq(a.owner, address(0xBEEF));
        assertEq(a.priceWei, 1e15);
        assertTrue(a.active);
    }
}

