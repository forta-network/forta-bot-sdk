import { fetchJwt, mockJwt } from "./utils"

describe("JWT util methods", () => {

    describe("fetchJWT", () => {
        const mockAxios = {
            post: jest.fn()
        } as any

        const resetMocks = () => {
            mockAxios.post.mockReset()
        }

        beforeEach(() => resetMocks())

        it("should return a mock JWT when bot is not in production mode", async () => {
            process.env.NODE_ENV = 'development'
            
            mockAxios.post.mockImplementation(() => {
                throw new Error();
            });

            const data = await fetchJwt({},undefined,mockAxios);
            expect(data?.token).toEqual(mockJwt)
        })
    })
})