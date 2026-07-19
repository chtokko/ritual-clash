const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VerdictArenaRitual", function () {
  async function deployFixture() {
    const [creator, opponent, outsider] = await ethers.getSigners();
    const llm = await ethers.deployContract("MockRitualLLM");
    await llm.waitForDeployment();
    const registry = await ethers.deployContract("MockTEERegistry", [await llm.getAddress()]);
    await registry.waitForDeployment();
    const arena = await ethers.deployContract("VerdictArenaRitual", [
      await registry.getAddress(),
      await llm.getAddress(),
    ]);
    await arena.waitForDeployment();
    await arena.connect(creator).createProfile("creator");
    await arena.connect(opponent).createProfile("opponent");
    return { arena, llm, creator, opponent, outsider };
  }

  async function readyRoom(fixture, stake = ethers.parseEther("1")) {
    const { arena, creator, opponent } = fixture;
    await arena.connect(creator).createRoom(0, "Tech", "Should open-source AI be mandatory?", { value: stake });
    await arena.connect(opponent).joinRoom(1, { value: stake });
    await arena.connect(creator).submitEntry(1, "Yes, because verifiability improves safety and public trust.");
    await arena.connect(opponent).submitEntry(1, "No, because forced disclosure can expose security weaknesses.");
    return stake;
  }

  it("creates profiles and a wagered room", async function () {
    const fixture = await deployFixture();
    const stake = await readyRoom(fixture);
    const room = await fixture.arena.getRoom(1);
    expect(room.status).to.equal(2n);
    expect(room.stake).to.equal(stake);
    expect(room.creator).to.equal(fixture.creator.address);
    expect(room.opponent).to.equal(fixture.opponent.address);
  });

  it("settles an LLM verdict, updates XP, and credits pull winnings", async function () {
    const fixture = await deployFixture();
    const stake = await readyRoom(fixture);
    await expect(fixture.arena.resolveRoom(1, await fixture.llm.getAddress()))
      .to.emit(fixture.arena, "RoomResolved")
      .withArgs(1, fixture.creator.address, "OWNER");

    const room = await fixture.arena.getRoom(1);
    const creatorProfile = await fixture.arena.profiles(fixture.creator.address);
    const opponentProfile = await fixture.arena.profiles(fixture.opponent.address);
    expect(room.status).to.equal(3n);
    expect(room.winner).to.equal(fixture.creator.address);
    expect(creatorProfile.wins).to.equal(1n);
    expect(creatorProfile.xp).to.equal(100n);
    expect(opponentProfile.losses).to.equal(1n);
    expect(await fixture.arena.claimableWinnings(fixture.creator.address)).to.equal(stake * 2n);
  });

  it("handles a tie without losing either stake", async function () {
    const fixture = await deployFixture();
    const stake = await readyRoom(fixture);
    await fixture.llm.setVerdict("TIE");
    await fixture.arena.resolveRoom(1, await fixture.llm.getAddress());
    expect(await fixture.arena.claimableWinnings(fixture.creator.address)).to.equal(stake);
    expect(await fixture.arena.claimableWinnings(fixture.opponent.address)).to.equal(stake);
  });

  it("rejects an executor that is not registered for LLM", async function () {
    const fixture = await deployFixture();
    await readyRoom(fixture);
    await expect(fixture.arena.resolveRoom(1, fixture.outsider.address)).to.be.revertedWith("invalid executor");
  });

  it("lets the winner withdraw once", async function () {
    const fixture = await deployFixture();
    await readyRoom(fixture);
    await fixture.arena.resolveRoom(1, await fixture.llm.getAddress());
    await expect(fixture.arena.connect(fixture.creator).withdrawWinnings())
      .to.emit(fixture.arena, "WinningsWithdrawn");
    expect(await fixture.arena.claimableWinnings(fixture.creator.address)).to.equal(0n);
    await expect(fixture.arena.connect(fixture.creator).withdrawWinnings()).to.be.revertedWith("nothing to withdraw");
  });
});
