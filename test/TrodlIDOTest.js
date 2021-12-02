const TrodlIDO = artifacts.require("TrodlIDO");
const PaymentToken = artifacts.require("PaymentToken");
const IssuanceToken = artifacts.require("IssuanceToken");
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const zero_address = "0x0000000000000000000000000000000000000000";

const one = web3.utils.toWei("1","ether");
const two = web3.utils.toWei("2","ether");
const quater = web3.utils.toWei("0.25","ether")
const half = web3.utils.toWei("0.5","ether");
const threeFourth = web3.utils.toWei("0.75","ether");

contract("TrodlIDO", async accounts => {
    let instance, pToken, iToken;

    const [ owner, project, investor1, investor2 ] = accounts;

    before(async () => {
        instance = await TrodlIDO.new();
        pToken = await PaymentToken.new({from: investor1});
        iToken = await IssuanceToken.new({from :project});
    });

    it("Creating a Simple Pool is possible", async () => {

        let startTime = await time.latest();

        let endTime = startTime.addn(86400);
        
        let issuanceLimit = web3.utils.toWei("1000","ether");

        let result = await instance.createSimplePool({issuanceLimit: issuanceLimit, startsAt: parseInt(startTime.toString()), endsAt: parseInt(endTime.toString()), paymentToken: pToken.address, issuanceToken:iToken.address, fee: {mantissa: 0}, rate: {mantissa: half} }, one, project);

        expect(await instance.owner()).to.be.equal(owner);

        let poolCount =  await instance.poolsCount();
        console.log("Created simple pool");

        let index = 0;
        await logSimplePoolData(index);

        console.log("Increase Issuance.. means add tokens being issued");

        let issuanceAmountRound1 = web3.utils.toWei("500","ether");
        await iToken.approve(instance.address, issuanceAmountRound1,{from: project});
        result = await instance.increaseIssuance(0, issuanceAmountRound1, {from: project});

        await iToken.approve(instance.address, issuanceAmountRound1,{from: project});
        result = await instance.increaseIssuance(0, issuanceAmountRound1, {from: project});

        result = await instance.createPaymentLimit(0,one,{from: project});

        result = await instance.changeLimit(0,1,two,{from: project});

        result =  await instance.setAccountsLimit(0, 1, [investor1, investor2],{from: project});

        await logSimplePoolData(index);

        // result =  await instance.setAccountsLimit(0, 0, [investor1, investor2],{from: project});

        let currentTime = await time.latest();
        let activePeriod = currentTime.addn(100); // active period: 1 day == 86400 seconds
        await time.increaseTo(activePeriod);

        await pToken.approve(instance.address, one, {from: investor1});
        result = await instance.swap(0, one,{from: investor1});

        await pToken.approve(instance.address, one, {from: investor1});
        result = await instance.swap(0, one,{from: investor1});

        // await pToken.approve(instance.address, one, {from: investor1});
        // result = await instance.swap(0, one,{from: investor1});

        await logSimplePoolData(index);

        let balance = await iToken.balanceOf(investor1);
        console.log(balance.toString());
    });

    it("Creating a Interval Pool is possible", async () => {

        let startTime = await time.latest();

        let endTime = startTime.addn(60);
        let interval1 = endTime.addn(60);
        let interval2 = interval1.addn(60);
        let interval3 = interval2.addn(60);

        
        let issuanceLimit = web3.utils.toWei("1000","ether");

        let result = await instance.createIntervalPool({issuanceLimit: issuanceLimit, startsAt: parseInt(startTime.toString()), endsAt: parseInt(endTime.toString()), paymentToken: pToken.address, issuanceToken:iToken.address, fee: {mantissa: 0}, rate: {mantissa: half} }, one, project, {mantissa: quater}, [{startsAt: parseInt(interval1.toString()), unlockingPart:{mantissa: half}},{startsAt: parseInt(interval2.toString()), unlockingPart:{mantissa: threeFourth}},{startsAt: parseInt(interval3.toString()), unlockingPart:{mantissa: one}}]);
        expect(await instance.owner()).to.be.equal(owner);

        let poolCount =  await instance.poolsCount();
        console.log("Created simple pool");

        let index = parseInt(poolCount)-1;
        await logIntervalPoolData(index);

        console.log("Increase Issuance.. means add tokens being issued");

        let issuanceAmountRound1 = web3.utils.toWei("500","ether");
        await iToken.approve(instance.address, issuanceAmountRound1,{from: project});
        result = await instance.increaseIssuance(index, issuanceAmountRound1, {from: project});

        await iToken.approve(instance.address, issuanceAmountRound1,{from: project});
        result = await instance.increaseIssuance(index, issuanceAmountRound1, {from: project});

        result = await instance.createPaymentLimit(index,one,{from: project});

        result = await instance.changeLimit(index,1,two,{from: project});

        result =  await instance.setAccountsLimit(index, 1, [investor1, investor2],{from: project});

        await logIntervalPoolData(index);

        let activePeriod = startTime.addn(30); // move between the state
        await time.increaseTo(activePeriod);

        await pToken.approve(instance.address, one, {from: investor1});
        result = await instance.swap(index, one,{from: investor1});

        await pToken.approve(instance.address, one, {from: investor1});
        result = await instance.swap(index, one,{from: investor1});

        await logIntervalPoolData(index);

        activePeriod = startTime.addn(160); // move between the state
        await time.increaseTo(activePeriod);

        result = await instance.unlockInterval(index, 0,{from: investor1});

        await logIntervalPoolData(index);

        activePeriod = startTime.addn(185); // move between the state
        await time.increaseTo(activePeriod);

        result = await instance.unlockInterval(index, 1,{from: investor1});

        await logIntervalPoolData(index);

        activePeriod = startTime.addn(245); // move between the state
        await time.increaseTo(activePeriod);

        result = await instance.unlockInterval(index, 2,{from: investor1});

        await logIntervalPoolData(index);

        let balance = await iToken.balanceOf(investor1);
        console.log(balance.toString());
    });

    it("Creating a Linear Pool is possible", async () => {

        let startTime = await time.latest();

        let endTime = startTime.addn(60);
        let interval1 = endTime.addn(60);
        let interval2 = interval1.addn(60);
        let interval3 = interval2.addn(60);

        
        let issuanceLimit = web3.utils.toWei("1000","ether");

        let result = await instance.createLinearPool({issuanceLimit: issuanceLimit, startsAt: parseInt(startTime.toString()), endsAt: parseInt(endTime.toString()), paymentToken: pToken.address, issuanceToken:iToken.address, fee: {mantissa: 0}, rate: {mantissa: half} }, one, project, {mantissa: quater}, parseInt(interval3.toString()));
        expect(await instance.owner()).to.be.equal(owner);

        let poolCount =  await instance.poolsCount();

        let index = parseInt(poolCount-1);
        await logLinearPoolData(index);

        console.log("Increase Issuance.. means add tokens being issued");

        let issuanceAmountRound1 = web3.utils.toWei("500","ether");
        await iToken.approve(instance.address, issuanceAmountRound1,{from: project});
        result = await instance.increaseIssuance(index, issuanceAmountRound1, {from: project});

        await iToken.approve(instance.address, issuanceAmountRound1,{from: project});
        result = await instance.increaseIssuance(index, issuanceAmountRound1, {from: project});

        result = await instance.createPaymentLimit(index,one,{from: project});

        result = await instance.changeLimit(index,1,two,{from: project});

        result =  await instance.setAccountsLimit(index, 1, [investor1, investor2],{from: project});

        await logLinearPoolData(index);

        // let activePeriod = startTime.addn(30); // move between the state
        // await time.increaseTo(activePeriod);

        await pToken.approve(instance.address, one, {from: investor1});
        result = await instance.swap(index, one,{from: investor1});

        await pToken.approve(instance.address, one, {from: investor1});
        result = await instance.swap(index, one,{from: investor1});

        await logLinearPoolData(index);

        activePeriod = startTime.addn(60); // move between the state
        await time.increaseTo(activePeriod);

        result = await instance.unlockLinear(index, {from: investor1});

        await logLinearPoolData(index);

        activePeriod = startTime.addn(90); // move between the state
        await time.increaseTo(activePeriod);

        result = await instance.unlockLinear(index, {from: investor1});

        await logLinearPoolData(index);

        activePeriod = startTime.addn(180); // move between the state
        await time.increaseTo(activePeriod);

        result = await instance.unlockLinear(index, {from: investor1});

        await logLinearPoolData(index);

        activePeriod = startTime.addn(245); // move between the state
        await time.increaseTo(activePeriod);

        result = await instance.unlockLinear(index, {from: investor1});

        await logLinearPoolData(index);

        let balance = await iToken.balanceOf(investor1);
        console.log(balance.toString());

    });


    const logSimplePoolData = async (index) => {
        
        console.log("Pool properties...");

        let poolTypeAndProps =  await instance.poolProps(index);
        console.log("Simple Pool: ");
        console.log(`Pool Type : ${poolTypeAndProps[0]}`);
        console.log(`Props: ${poolTypeAndProps[1]}`);

        let poolState =  await instance.poolState(index);
        console.log(`poolState: ${poolState}`);

        console.log("Pool Investor Accounts...");

        let length =2;
        for( let  i =0; i< length; i++){
            let poolAccount =  await instance.poolAccount(index, accounts[i+2]);
            console.log(`Simple Pool for: ${accounts[i+2]} `);
            console.log(`Pool Type : ${poolAccount[0]}`);
            console.log(`poolAccount: ${poolAccount[1]}`);
        }
    }

    const logIntervalPoolData = async (index) => {
        
        console.log("Pool properties...");

        let intervalPoolProps = await instance.intervalPoolProps(index);
        console.log("Interval Pool: ");
        console.log(`Props : ${intervalPoolProps[0]}`);
        console.log(`immediatelyUnlockingPart: ${intervalPoolProps[1]}`);
        console.log(`intervals: ${intervalPoolProps[2]}`);
        
        let poolState =  await instance.poolState(index);
        console.log(`poolState: ${poolState}`);

        console.log("Pool Investor Accounts...");

        let length =2;
        for( let  i =0; i< length; i++){ 
            let intervalPoolAccount =  await instance.intervalPoolAccount(index, accounts[i+2]);
            console.log(`Interval Pool for: ${accounts[i+2]}`);
            console.log(`state: ${intervalPoolAccount[0]}`);
            console.log(`complex: ${intervalPoolAccount[1]}`);
            console.log(`unlockedIntervalsCount: ${intervalPoolAccount[2]}`);
        }

        console.log("***************************************************************");
    }

    const logLinearPoolData = async (index) => {
        
        console.log("Pool properties...");

        let linearPoolProps =  await instance.linearPoolProps(index);
        console.log("Linear Pool: ");
        console.log(`Props: ${linearPoolProps[0]}`);
        console.log(`immediatelyUnlockingPart: ${linearPoolProps[1]}`);
        console.log(`Linear props: ${linearPoolProps[2]}`);

        let poolState =  await instance.poolState(index);
        console.log(`poolState: ${poolState}`);

        console.log("Pool Investor Accounts...");

        let length =2;
        for( let  i =0; i< length; i++){ 
            let linearPoolAccount =  await instance.linearPoolAccount(index, accounts[i+2]);
            console.log(`Linear Pool for: ${accounts[i+2]}`);
            console.log(`state: ${linearPoolAccount[0]}`);
            console.log(`complex: ${linearPoolAccount[1]}`);
            console.log(`immediatelyUnlockedAmount: ${linearPoolAccount[2]}`);
        }

        console.log("***************************************************************");
    }
});