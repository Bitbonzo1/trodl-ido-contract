const IssuanceToken = artifacts.require("IssuanceToken");
const PaymentToken = artifacts.require("PaymentToken");
const TrodlIDO = artifacts.require("TrodlIDO");
const { time } = require('@openzeppelin/test-helpers');

module.exports = async function (deployer, networks, accounts) {

  const one = web3.utils.toWei("1","ether");
  const two = web3.utils.toWei("2","ether");
  const quater = web3.utils.toWei("0.25","ether")
  const half = web3.utils.toWei("0.5","ether");
  const threeFourth = web3.utils.toWei("0.75","ether");

  const [ owner, project, investor1, investor2 ] = accounts;
  await deployer.deploy(IssuanceToken, {from: project});
  await deployer.deploy(PaymentToken, {from: investor1});

  let iToken = await IssuanceToken.deployed();
  let pToken = await PaymentToken.deployed();
  let instance = await TrodlIDO.deployed()

  let startTime = await time.latest();
  let endTime = startTime.addn(86400);
  let issuanceLimit = web3.utils.toWei("1000","ether");
  await instance.createSimplePool({issuanceLimit: issuanceLimit, startsAt: parseInt(startTime.toString()), endsAt: parseInt(endTime.toString()), paymentToken: pToken.address, issuanceToken:iToken.address, fee: {mantissa: 0}, rate: {mantissa: half} }, one, project,{from: owner});

  startTime = await time.latest();
  endTime = startTime.addn(60);
  let interval1 = endTime.addn(60);
  let interval2 = interval1.addn(60);
  let interval3 = interval2.addn(60);

  await instance.createIntervalPool({issuanceLimit: issuanceLimit, startsAt: parseInt(startTime.toString()), endsAt: parseInt(endTime.toString()), paymentToken: pToken.address, issuanceToken:iToken.address, fee: {mantissa: 0}, rate: {mantissa: half} }, one, project, {mantissa: quater}, [{startsAt: parseInt(interval1.toString()), unlockingPart:{mantissa: half}},{startsAt: parseInt(interval2.toString()), unlockingPart:{mantissa: threeFourth}},{startsAt: parseInt(interval3.toString()), unlockingPart:{mantissa: one}}], {from: owner});

  startTime = await time.latest();
  endTime = startTime.addn(60);
  interval = endTime.addn(180);

  await instance.createLinearPool({issuanceLimit: issuanceLimit, startsAt: parseInt(startTime.toString()), endsAt: parseInt(endTime.toString()), paymentToken: pToken.address, issuanceToken:iToken.address, fee: {mantissa: 0}, rate: {mantissa: half} }, one, project, {mantissa: quater}, parseInt(interval.toString()));

};
