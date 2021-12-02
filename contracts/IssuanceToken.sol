// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract IssuanceToken is ERC20 {
    constructor() public ERC20("PaymentToken", "PTM") {
        _mint(msg.sender, 1000 * 10**18);
    }
}
