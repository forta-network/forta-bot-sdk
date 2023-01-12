import { Network } from ".."

describe("supported networks", () => {
    it('etherum should be in Network type', () => {
        expect(Network.MAINNET).toBeDefined()
    })
})