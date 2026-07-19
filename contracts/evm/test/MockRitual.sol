// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {TEEServiceContext, TEEServiceNode} from "../VerdictArenaRitual.sol";

struct MockStorageRef {
    string platform;
    string path;
    string keyRef;
}

contract MockTEERegistry {
    address public executor;

    constructor(address executor_) { executor = executor_; }

    function getService(address service, bool) external view returns (TEEServiceContext memory context) {
        context.node = TEEServiceNode(address(0), service, 1, "", "", bytes32(0), 1);
        context.isValid = service == executor;
    }
}

contract MockRitualLLM {
    string public verdict = "OWNER";

    function setVerdict(string calldata nextVerdict) external { verdict = nextVerdict; }

    fallback(bytes calldata input) external returns (bytes memory) {
        bytes[] memory toolCalls = new bytes[](0);
        bytes memory message = abi.encode("assistant", verdict, "", uint256(0), toolCalls);
        bytes[] memory choices = new bytes[](1);
        choices[0] = abi.encode(uint256(0), "stop", message);
        bytes memory usage = abi.encode(uint256(20), uint256(1), uint256(21));
        bytes memory completion = abi.encode(
            "mock", "chat.completion", block.timestamp, "zai-org/GLM-4.7-FP8", "", "default",
            uint256(1), choices, usage
        );
        bytes memory actual = abi.encode(false, completion, bytes(""), "", MockStorageRef("", "", ""));
        bytes memory envelope = abi.encode(input, actual);
        assembly { return(add(envelope, 32), mload(envelope)) }
    }
}
