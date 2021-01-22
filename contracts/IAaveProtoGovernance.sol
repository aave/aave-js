pragma solidity ^0.6.8;

interface IAaveProtoGovernance {
    function newProposal(
        bytes32 _proposalType,
        bytes32 _ipfsHash,
        uint256 _threshold,
        address _proposalExecutor,
        uint256 _votingBlocksDuration,
        uint256 _validatingBlocksDuration,
        uint256 _maxMovesToVotingAllowed
    ) external;

    function submitVoteByVoter(uint256 _proposalId, uint256 _vote, address _asset) external;

    function cancelVoteByVoter(uint256 _proposalId) external;

    function tryToMoveToValidating(uint256 _proposalId) external;

    function challengeVoters(uint256 _proposalId, address[] calldata _voters) external;

    function resolveProposal(uint256 _proposalId) external;
}