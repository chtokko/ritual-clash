// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

struct TEEServiceNode {
    address paymentAddress;
    address teeAddress;
    uint8 teeType;
    bytes publicKey;
    string endpoint;
    bytes32 certPubKeyHash;
    uint8 capability;
}

struct TEEServiceContext {
    TEEServiceNode node;
    bool isValid;
    bytes32 workloadId;
}

interface ITEEServiceRegistry {
    function getService(address service, bool checkValidity)
        external
        view
        returns (TEEServiceContext memory context);
}

contract VerdictArenaRitual {
    enum Mode { Argue, Bluff, PromptDuel }
    enum Status { Waiting, Active, Ready, Resolved, Cancelled }
    enum Verdict { Unknown, Creator, Opponent, Tie }

    struct StorageRef {
        string platform;
        string path;
        string keyRef;
    }

    struct Profile {
        string handle;
        uint64 wins;
        uint64 losses;
        uint64 ties;
        uint128 xp;
        bool exists;
    }

    struct Room {
        uint256 id;
        Mode mode;
        Status status;
        address creator;
        address opponent;
        address winner;
        uint128 stake;
        uint64 createdAt;
        string category;
        string topic;
        string creatorSubmission;
        string opponentSubmission;
        string verdict;
        string resolutionError;
    }

    string public constant MODEL = "zai-org/GLM-4.7-FP8";
    uint256 public constant LLM_TTL = 300;
    uint256 public constant MAX_TOPIC_BYTES = 240;
    uint256 public constant MAX_SUBMISSION_BYTES = 1_000;
    uint8 private constant LLM_CAPABILITY = 1;

    address public immutable llmPrecompile;
    ITEEServiceRegistry public immutable teeRegistry;

    uint256 public nextRoomId = 1;
    mapping(address => Profile) public profiles;
    address[] private playerAddresses;
    mapping(uint256 => Room) private rooms;
    mapping(address => uint256) public claimableWinnings;

    bool private withdrawalLocked;

    event ProfileCreated(address indexed player, string handle);
    event ProfileRenamed(address indexed player, string handle);
    event RoomCreated(uint256 indexed roomId, Mode indexed mode, address indexed creator, uint256 stake);
    event RoomJoined(uint256 indexed roomId, address indexed opponent);
    event EntrySubmitted(uint256 indexed roomId, address indexed player);
    event ResolutionFailed(uint256 indexed roomId, string reason);
    event RoomResolved(uint256 indexed roomId, address indexed winner, string verdict);
    event RoomCancelled(uint256 indexed roomId);
    event WinningsWithdrawn(address indexed player, uint256 amount);

    constructor(address registryAddress, address llmAddress) {
        require(registryAddress != address(0) && llmAddress != address(0), "zero system address");
        teeRegistry = ITEEServiceRegistry(registryAddress);
        llmPrecompile = llmAddress;
    }

    function createProfile(string calldata handle) external {
        require(!profiles[msg.sender].exists, "profile exists");
        _validateHandle(handle);
        profiles[msg.sender] = Profile(handle, 0, 0, 0, 0, true);
        playerAddresses.push(msg.sender);
        emit ProfileCreated(msg.sender, handle);
    }

    function renameProfile(string calldata handle) external {
        require(profiles[msg.sender].exists, "profile missing");
        _validateHandle(handle);
        profiles[msg.sender].handle = handle;
        emit ProfileRenamed(msg.sender, handle);
    }

    function createRoom(Mode mode, string calldata category, string calldata topic)
        external
        payable
        returns (uint256 roomId)
    {
        require(profiles[msg.sender].exists, "profile required");
        require(bytes(category).length > 0 && bytes(category).length <= 48, "invalid category");
        require(bytes(topic).length >= 8 && bytes(topic).length <= MAX_TOPIC_BYTES, "invalid topic");
        require(msg.value <= type(uint128).max, "stake too large");

        roomId = nextRoomId++;
        Room storage room = rooms[roomId];
        room.id = roomId;
        room.mode = mode;
        room.status = Status.Waiting;
        room.creator = msg.sender;
        room.stake = uint128(msg.value);
        room.createdAt = uint64(block.timestamp);
        room.category = category;
        room.topic = topic;

        emit RoomCreated(roomId, mode, msg.sender, msg.value);
    }

    function joinRoom(uint256 roomId) external payable {
        Room storage room = _room(roomId);
        require(room.status == Status.Waiting, "room unavailable");
        require(msg.sender != room.creator, "creator cannot join");
        require(profiles[msg.sender].exists, "profile required");
        require(msg.value == room.stake, "stake mismatch");

        room.opponent = msg.sender;
        room.status = Status.Active;
        emit RoomJoined(roomId, msg.sender);
    }

    function submitEntry(uint256 roomId, string calldata submission) external {
        Room storage room = _room(roomId);
        require(room.status == Status.Active, "room not active");
        uint256 length = bytes(submission).length;
        require(length >= 3 && length <= MAX_SUBMISSION_BYTES, "invalid submission");

        if (msg.sender == room.creator) {
            require(bytes(room.creatorSubmission).length == 0, "already submitted");
            room.creatorSubmission = submission;
        } else if (msg.sender == room.opponent) {
            require(bytes(room.opponentSubmission).length == 0, "already submitted");
            room.opponentSubmission = submission;
        } else {
            revert("not a player");
        }

        if (bytes(room.creatorSubmission).length != 0 && bytes(room.opponentSubmission).length != 0) {
            room.status = Status.Ready;
        }
        emit EntrySubmitted(roomId, msg.sender);
    }

    function resolveRoom(uint256 roomId, address executor) external returns (bool resolved) {
        Room storage room = _room(roomId);
        require(room.status == Status.Ready, "room not ready");
        _validateExecutor(executor);

        bytes memory input = _encodeLLMRequest(executor, _buildMessages(room));
        (bool success, bytes memory raw) = llmPrecompile.call(input);
        require(success, "LLM precompile call failed");
        if (raw.length == 0) return false;

        (, bytes memory actualOutput) = abi.decode(raw, (bytes, bytes));
        if (actualOutput.length == 0) return false; // fresh simulation; fulfilled replay arrives later

        (bool hasError, bytes memory completionData, , string memory errorMessage, ) =
            abi.decode(actualOutput, (bool, bytes, bytes, string, StorageRef));
        if (hasError) {
            room.resolutionError = errorMessage;
            emit ResolutionFailed(roomId, errorMessage);
            return false;
        }

        string memory content;
        try this.decodeCompletionContent(completionData) returns (string memory decoded) {
            content = decoded;
        } catch {
            room.resolutionError = "Malformed LLM completion";
            emit ResolutionFailed(roomId, room.resolutionError);
            return false;
        }

        Verdict result = _classifyVerdict(content);
        if (result == Verdict.Unknown) {
            room.resolutionError = "Judge did not return OWNER, OPPONENT, or TIE";
            emit ResolutionFailed(roomId, room.resolutionError);
            return false;
        }

        _settleRoom(room, result, content);
        return true;
    }

    function decodeCompletionContent(bytes calldata completionData) external pure returns (string memory content) {
        (, , , , , , uint256 choicesCount, bytes[] memory choicesData, ) = abi.decode(
            completionData,
            (string, string, uint256, string, string, string, uint256, bytes[], bytes)
        );
        require(choicesCount > 0 && choicesData.length > 0, "no choices");
        (, , bytes memory messageData) = abi.decode(choicesData[0], (uint256, string, bytes));
        (, content, , , ) = abi.decode(messageData, (string, string, string, uint256, bytes[]));
    }

    function cancelRoom(uint256 roomId) external {
        Room storage room = _room(roomId);
        require(msg.sender == room.creator, "creator only");
        require(room.status == Status.Waiting, "cannot cancel");
        room.status = Status.Cancelled;
        claimableWinnings[msg.sender] += room.stake;
        emit RoomCancelled(roomId);
    }

    function withdrawWinnings() external {
        require(!withdrawalLocked, "withdrawal locked");
        uint256 amount = claimableWinnings[msg.sender];
        require(amount > 0, "nothing to withdraw");
        withdrawalLocked = true;
        claimableWinnings[msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        withdrawalLocked = false;
        require(ok, "withdrawal failed");
        emit WinningsWithdrawn(msg.sender, amount);
    }

    function getRoom(uint256 roomId) external view returns (Room memory) {
        return _room(roomId);
    }

    function getRecentRooms(uint256 limit) external view returns (Room[] memory result) {
        uint256 total = nextRoomId - 1;
        if (limit > total) limit = total;
        if (limit > 50) limit = 50;
        result = new Room[](limit);
        for (uint256 i; i < limit; ++i) result[i] = rooms[total - i];
    }

    function getPlayers() external view returns (address[] memory) {
        return playerAddresses;
    }

    function _settleRoom(Room storage room, Verdict result, string memory rawVerdict) internal {
        room.status = Status.Resolved;
        room.resolutionError = "";
        room.verdict = rawVerdict;
        uint256 pot = uint256(room.stake) * 2;

        if (result == Verdict.Creator) {
            room.winner = room.creator;
            claimableWinnings[room.creator] += pot;
            _recordWin(room.creator, room.opponent);
        } else if (result == Verdict.Opponent) {
            room.winner = room.opponent;
            claimableWinnings[room.opponent] += pot;
            _recordWin(room.opponent, room.creator);
        } else {
            claimableWinnings[room.creator] += room.stake;
            claimableWinnings[room.opponent] += room.stake;
            profiles[room.creator].ties++;
            profiles[room.opponent].ties++;
            profiles[room.creator].xp += 25;
            profiles[room.opponent].xp += 25;
        }
        emit RoomResolved(room.id, room.winner, rawVerdict);
    }

    function _recordWin(address winner, address loser) internal {
        profiles[winner].wins++;
        profiles[winner].xp += 100;
        profiles[loser].losses++;
        profiles[loser].xp += 20;
    }

    function _validateExecutor(address executor) internal view {
        require(executor != address(0), "zero executor");
        TEEServiceContext memory context = teeRegistry.getService(executor, true);
        require(context.isValid, "invalid executor");
        require(context.node.teeAddress == executor, "executor mismatch");
        require(context.node.capability == LLM_CAPABILITY, "not an LLM executor");
    }

    function _encodeLLMRequest(address executor, string memory messagesJson) internal pure returns (bytes memory) {
        StorageRef memory noHistory = StorageRef("", "", "");
        return abi.encode(
            executor,
            new bytes[](0),
            LLM_TTL,
            new bytes[](0),
            bytes(""),
            messagesJson,
            MODEL,
            int256(0),
            "",
            false,
            int256(4096),
            "",
            "",
            uint256(1),
            true,
            int256(0),
            "medium",
            bytes(""),
            int256(-1),
            "auto",
            "",
            false,
            int256(200),
            bytes(""),
            bytes(""),
            int256(-1),
            int256(1000),
            "",
            false,
            noHistory
        );
    }

    function _buildMessages(Room storage room) internal view returns (string memory) {
        string memory rules = room.mode == Mode.Argue
            ? "Choose the clearer, better-supported argument."
            : room.mode == Mode.Bluff
                ? "Choose the more persuasive bluff, ignoring whether the claim is factually true."
                : "Choose the prompt most likely to reproduce the target accurately; use brevity only as a tie-breaker.";

        return string.concat(
            '[{"role":"system","content":"You are the impartial judge of Ritual Clash. ',
            rules,
            ' Reply with exactly one token: OWNER, OPPONENT, or TIE. Do not add punctuation or explanation."},{"role":"user","content":"Mode: ',
            _modeName(room.mode),
            '\\nCategory: ',
            _jsonEscape(room.category),
            '\\nChallenge: ',
            _jsonEscape(room.topic),
            '\\nOWNER entry: ',
            _jsonEscape(room.creatorSubmission),
            '\\nOPPONENT entry: ',
            _jsonEscape(room.opponentSubmission),
            '"}]'
        );
    }

    function _modeName(Mode mode) internal pure returns (string memory) {
        if (mode == Mode.Argue) return "Argue";
        if (mode == Mode.Bluff) return "Bluff";
        return "Prompt Duel";
    }

    function _classifyVerdict(string memory value) internal pure returns (Verdict) {
        bytes memory data = bytes(value);
        uint256 start;
        uint256 end = data.length;
        while (start < end && _isTrimByte(data[start])) ++start;
        while (end > start && _isTrimByte(data[end - 1])) --end;
        if (end > start + 1 && data[start] == bytes1('"') && data[end - 1] == bytes1('"')) {
            ++start;
            --end;
        }
        bytes32 digest;
        assembly { digest := keccak256(add(add(data, 32), start), sub(end, start)) }
        if (digest == keccak256("OWNER")) return Verdict.Creator;
        if (digest == keccak256("OPPONENT")) return Verdict.Opponent;
        if (digest == keccak256("TIE")) return Verdict.Tie;
        return Verdict.Unknown;
    }

    function _isTrimByte(bytes1 value) internal pure returns (bool) {
        return value == 0x20 || value == 0x0a || value == 0x0d || value == 0x09;
    }

    function _jsonEscape(string memory value) internal pure returns (string memory) {
        bytes memory source = bytes(value);
        bytes memory output = new bytes(source.length * 2);
        uint256 length;
        for (uint256 i; i < source.length; ++i) {
            bytes1 char = source[i];
            if (char == bytes1('"') || char == bytes1('\\')) {
                output[length++] = bytes1('\\');
                output[length++] = char;
            } else if (char == 0x0a) {
                output[length++] = bytes1('\\'); output[length++] = bytes1('n');
            } else if (char == 0x0d) {
                output[length++] = bytes1('\\'); output[length++] = bytes1('r');
            } else if (char == 0x09) {
                output[length++] = bytes1('\\'); output[length++] = bytes1('t');
            } else {
                require(uint8(char) >= 0x20, "unsupported control character");
                output[length++] = char;
            }
        }
        assembly { mstore(output, length) }
        return string(output);
    }

    function _validateHandle(string calldata handle) internal pure {
        uint256 length = bytes(handle).length;
        require(length >= 3 && length <= 24, "handle length");
    }

    function _room(uint256 roomId) internal view returns (Room storage room) {
        room = rooms[roomId];
        require(room.id != 0, "room missing");
    }
}
